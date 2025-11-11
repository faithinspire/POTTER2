import { supabase } from './supabase';

export interface Document {
  id: string;
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  branch_id: string;
  created_at: string;
}

export class DocumentService {
  /**
   * Upload a document
   */
  static async uploadDocument(
    file: File,
    entityType: string,
    entityId: string,
    branchId: string
  ): Promise<Document | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${entityType}_${entityId}_${Date.now()}.${fileExt}`;
      const filePath = `documents/${branchId}/${entityType}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
          branch_id: branchId
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return documentData;
    } catch (error) {
      console.error('Document upload error:', error);
      return null;
    }
  }

  /**
   * Get documents for an entity
   */
  static async getEntityDocuments(entityType: string, entityId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        uploader:users!documents_uploaded_by_fkey(full_name)
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get documents error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get document download URL
   */
  static async getDocumentUrl(filePath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;

      return data.signedUrl;
    } catch (error) {
      console.error('Get document URL error:', error);
      return null;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Get document info first
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error('Delete document error:', error);
      return false;
    }
  }

  /**
   * Get all documents for a branch
   */
  static async getBranchDocuments(branchId: string, limit: number = 100): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        uploader:users!documents_uploaded_by_fkey(full_name)
      `)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Get branch documents error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Search documents
   */
  static async searchDocuments(query: string, branchId?: string): Promise<Document[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    let searchQuery = supabase
      .from('documents')
      .select(`
        *,
        uploader:users!documents_uploaded_by_fkey(full_name)
      `)
      .ilike('file_name', searchTerm);

    if (branchId) {
      searchQuery = searchQuery.eq('branch_id', branchId);
    }

    const { data, error } = await searchQuery
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Search documents error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get document statistics
   */
  static async getDocumentStats(branchId?: string) {
    let query = supabase
      .from('documents')
      .select('entity_type, file_size, created_at');

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Get document stats error:', error);
      return null;
    }

    const stats = {
      totalDocuments: data?.length || 0,
      totalSize: data?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0,
      byEntityType: {} as Record<string, number>,
      recentUploads: data?.filter(doc => {
        const uploadDate = new Date(doc.created_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return uploadDate > weekAgo;
      }).length || 0
    };

    data?.forEach(doc => {
      stats.byEntityType[doc.entity_type] = (stats.byEntityType[doc.entity_type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed. Please upload images, PDFs, or documents.' };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon based on mime type
   */
  static getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.startsWith('text/')) return '📄';
    return '📎';
  }

  /**
   * Bulk upload documents
   */
  static async bulkUpload(
    files: File[],
    entityType: string,
    entityId: string,
    branchId: string,
    onProgress?: (progress: number) => void
  ): Promise<{ success: Document[]; failed: { file: File; error: string }[] }> {
    const success: Document[] = [];
    const failed: { file: File; error: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        failed.push({ file, error: validation.error || 'Invalid file' });
        continue;
      }

      // Upload file
      const result = await this.uploadDocument(file, entityType, entityId, branchId);
      if (result) {
        success.push(result);
      } else {
        failed.push({ file, error: 'Upload failed' });
      }

      // Update progress
      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100);
      }
    }

    return { success, failed };
  }
}