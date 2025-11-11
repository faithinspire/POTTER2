# 📸 Photo Upload Implementation Guide

## 🎯 What Needs to Be Added

When agents register customers, they need to upload:
1. **Customer Passport Photo**
2. **Customer ID Photo**
3. **Guarantor Passport Photo** (for each guarantor)
4. **Guarantor ID Photo** (for each guarantor)

---

## 📋 Database Already Ready ✅

The database columns were already added in migration `011_add_new_features.sql`:

```sql
-- customers table
ALTER TABLE customers ADD COLUMN passport_photo_url TEXT;
ALTER TABLE customers ADD COLUMN id_photo_url TEXT;

-- guarantors table
ALTER TABLE guarantors ADD COLUMN passport_photo_url TEXT;
ALTER TABLE guarantors ADD COLUMN id_photo_url TEXT;
```

---

## 🔧 Implementation Options

### Option 1: Supabase Storage (Recommended)
**Pros:**
- Integrated with Supabase
- Secure, scalable
- CDN delivery
- Easy to implement

**Cons:**
- Requires Supabase storage setup
- Need to configure buckets

### Option 2: Base64 Encoding (Quick Solution)
**Pros:**
- No external storage needed
- Works immediately
- Simple implementation

**Cons:**
- Larger database size
- Slower performance
- Not recommended for production

### Option 3: External Service (Cloudinary, AWS S3)
**Pros:**
- Professional solution
- Image optimization
- CDN delivery

**Cons:**
- Additional cost
- More complex setup
- External dependency

---

## 🚀 Quick Implementation (Base64)

### Step 1: Add File Input Fields

Update `src/pages/agent/RegisterCustomer.tsx`:

```typescript
// Add to state
const [customerPhotos, setCustomerPhotos] = useState({
  passport: null as File | null,
  id: null as File | null,
});

const [guarantorPhotos, setGuarantorPhotos] = useState<{
  [key: number]: { passport: File | null; id: File | null };
}>({});

// Add file handlers
const handleCustomerPhotoChange = (type: 'passport' | 'id', file: File | null) => {
  setCustomerPhotos(prev => ({ ...prev, [type]: file }));
};

const handleGuarantorPhotoChange = (index: number, type: 'passport' | 'id', file: File | null) => {
  setGuarantorPhotos(prev => ({
    ...prev,
    [index]: { ...prev[index], [type]: file }
  }));
};

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
```

### Step 2: Add File Input Components

```tsx
{/* Customer Passport Photo */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Customer Passport Photo *
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => handleCustomerPhotoChange('passport', e.target.files?.[0] || null)}
    className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white"
    required
  />
  {customerPhotos.passport && (
    <p className="text-xs text-green-400 mt-1">
      ✓ {customerPhotos.passport.name}
    </p>
  )}
</div>

{/* Customer ID Photo */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Customer ID Photo *
  </label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => handleCustomerPhotoChange('id', e.target.files?.[0] || null)}
    className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white"
    required
  />
  {customerPhotos.id && (
    <p className="text-xs text-green-400 mt-1">
      ✓ {customerPhotos.id.name}
    </p>
  )}
</div>
```

### Step 3: Update Submit Handler

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    
    // Convert photos to base64
    const customerPassportUrl = customerPhotos.passport 
      ? await fileToBase64(customerPhotos.passport)
      : null;
    
    const customerIdUrl = customerPhotos.id
      ? await fileToBase64(customerPhotos.id)
      : null;
    
    // Create customer with photos
    const customerId = await CustomerService.createCustomer({
      ...customer,
      passport_photo_url: customerPassportUrl,
      id_photo_url: customerIdUrl,
      agent_id: profile!.id,
      branch_id: profile!.branch_id!,
    });
    
    // Create guarantors with photos
    for (let i = 0; i < guarantors.length; i++) {
      const guarantorPassportUrl = guarantorPhotos[i]?.passport
        ? await fileToBase64(guarantorPhotos[i].passport!)
        : null;
      
      const guarantorIdUrl = guarantorPhotos[i]?.id
        ? await fileToBase64(guarantorPhotos[i].id!)
        : null;
      
      await CustomerService.createGuarantor({
        ...guarantors[i],
        customer_id: customerId,
        passport_photo_url: guarantorPassportUrl,
        id_photo_url: guarantorIdUrl,
      });
    }
    
    setSuccess(true);
    alert('Customer registered successfully!');
    navigate('/agent/customers');
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 🏆 Better Implementation (Supabase Storage)

### Step 1: Create Storage Bucket

In Supabase Dashboard:
1. Go to Storage
2. Create new bucket: `customer-photos`
3. Set to Public
4. Configure policies

### Step 2: Upload Function

```typescript
const uploadPhoto = async (file: File, path: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('customer-photos')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('customer-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

### Step 3: Use in Submit

```typescript
// Upload customer photos
const customerPassportUrl = customerPhotos.passport
  ? await uploadPhoto(customerPhotos.passport, 'customers/passports')
  : null;

const customerIdUrl = customerPhotos.id
  ? await uploadPhoto(customerPhotos.id, 'customers/ids')
  : null;
```

---

## 📱 UI Components

### Photo Preview Component

```tsx
const PhotoPreview = ({ file }: { file: File | null }) => {
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, [file]);

  if (!preview) return null;

  return (
    <img 
      src={preview} 
      alt="Preview" 
      className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-700"
    />
  );
};
```

### Usage

```tsx
<input
  type="file"
  accept="image/*"
  onChange={(e) => handleCustomerPhotoChange('passport', e.target.files?.[0] || null)}
/>
<PhotoPreview file={customerPhotos.passport} />
```

---

## ✅ Complete Example

Here's a complete form section with photo uploads:

```tsx
{/* Customer Photos Section */}
<div className="glass-card p-6 mb-6">
  <h3 className="text-xl font-semibold text-white mb-4">
    📸 Customer Photos
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Passport Photo */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Passport Photo *
      </label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleCustomerPhotoChange('passport', e.target.files?.[0] || null)}
        className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        required
      />
      <PhotoPreview file={customerPhotos.passport} />
    </div>

    {/* ID Photo */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        ID Card Photo *
      </label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleCustomerPhotoChange('id', e.target.files?.[0] || null)}
        className="w-full px-4 py-2 bg-white/10 border border-gray-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        required
      />
      <PhotoPreview file={customerPhotos.id} />
    </div>
  </div>
</div>
```

---

## 🎯 Recommended Approach

**For Quick Testing:** Use Base64 (Option 2)
- Works immediately
- No setup required
- Good for development

**For Production:** Use Supabase Storage (Option 1)
- Professional solution
- Better performance
- Scalable

---

## 📋 Checklist

- [ ] Add photo state variables
- [ ] Add file input fields
- [ ] Add photo preview
- [ ] Update submit handler
- [ ] Test photo upload
- [ ] Verify photos save to database
- [ ] Test on mobile (camera access)
- [ ] Add validation (file size, type)
- [ ] Add loading indicators
- [ ] Handle errors gracefully

---

## 💡 Tips

1. **File Size Limit:** Max 5MB per photo
2. **Accepted Formats:** JPG, PNG, WEBP
3. **Mobile Camera:** Use `capture="environment"` attribute
4. **Compression:** Consider compressing images before upload
5. **Validation:** Check file type and size before upload

---

## 🐛 Common Issues

### "File too large"
**Solution:** Add file size validation
```typescript
if (file.size > 5 * 1024 * 1024) {
  alert('File too large. Max 5MB');
  return;
}
```

### "Invalid file type"
**Solution:** Check file type
```typescript
if (!file.type.startsWith('image/')) {
  alert('Please select an image file');
  return;
}
```

### "Upload failed"
**Solution:** Check Supabase storage permissions

---

## ✨ Next Steps

1. Implement photo upload in RegisterCustomer.tsx
2. Test with real photos
3. Add photo display in customer list
4. Add photo viewing in customer details
5. Consider adding photo editing/cropping

**Ready to implement!** 🚀
