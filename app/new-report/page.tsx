// frontend/app/new-report/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react'; // Import MapPin icon for location button
import { useAuth } from '@/lib/auth'; // Import useAuth to get axiosInstance

export default function NewReportPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState<'LOST' | 'FOUND'>('LOST');
  const [subjectType, setSubjectType] = useState<'PERSON' | 'ITEM'>('ITEM');
  const [description, setDescription] = useState<string>('');
  const [language, setLanguage] = useState<string>('English');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [locationDescription, setLocationDescription] = useState<string>('');
  const [photos, setPhotos] = useState<FileList | null>(null);

  // Conditional fields
  const [itemName, setItemName] = useState<string>('');
  const [itemColor, setItemColor] = useState<string>('');
  const [itemBrand, setItemBrand] = useState<string>('');

  const [personName, setPersonName] = useState<string>('');
  const [personAge, setPersonAge] = useState<string>('');
  const [guardianContact, setGuardianContact] = useState<string>('');
  const [isChild, setIsChild] = useState<boolean>(false);
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [identifyingFeatures, setIdentifyingFeatures] = useState<string>('');
  const [clothingDescription, setClothingDescription] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { axiosInstance } = useAuth(); // Get axiosInstance from AuthContext

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('type', reportType);
    formData.append('subject', subjectType); // Use 'subject' as alias for backend
    formData.append('desc_text', description); // Use 'desc_text' as alias
    formData.append('lang', language); // Use 'lang' as alias
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    if (locationDescription) formData.append('location_desc', locationDescription);
    formData.append('refs', 'placeholder_id'); // Temporary placeholder for refs, adjust as needed

    if (photos) {
      for (let i = 0; i < photos.length; i++) {
        formData.append('photos', photos[i]);
      }
    }

    // Append conditional fields
    if (subjectType === 'ITEM') {
      // No direct item_name, item_color, item_brand as form fields in backend reports.py
      // These should be handled by ref_ids linking to actual Item documents if needed.
      // For now, these frontend states are not directly sent as form fields.
    } else if (subjectType === 'PERSON') {
      // No direct person_name, person_age, guardian_contact as form fields for report in backend reports.py
      // These details are now part of person_details object in report schema.
      // The backend expects is_child, height_cm, etc., directly as form fields.
      formData.append('is_child', String(isChild)); // Convert boolean to string for FormData
      if (heightCm) formData.append('height_cm', heightCm);
      if (weightKg) formData.append('weight_kg', weightKg);
      if (identifyingFeatures) formData.append('identifying_features', identifyingFeatures);
      if (clothingDescription) formData.append('clothing_description', clothingDescription);
    }

    try {
      const reportEndpoint = `/reports/${reportType.toLowerCase()}`;
      const response = await axiosInstance.post(reportEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Axios handles this automatically with FormData
        },
      });

      if (response.status === 201) { // Assuming 201 Created status for success
        setSuccessMessage('Report submitted successfully!');
        setTimeout(() => {
          router.push('/feed'); // Redirect to the new feed page
        }, 2000);
      } else {
        setError(response.data.detail || 'Failed to submit report.');
      }
    } catch (err: any) {
      console.error("Client-side error submitting report:", err.response?.data || err.message || err);
      setError(err.response?.data?.detail || err.message || 'An unexpected error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Report</h1>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Report Type */}
        <div>
          <Label htmlFor="reportType">Report Type</Label>
          <RadioGroup value={reportType} onValueChange={(value: 'LOST' | 'FOUND') => setReportType(value)} className="flex space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="LOST" id="report-lost" />
              <Label htmlFor="report-lost">Lost</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FOUND" id="report-found" />
              <Label htmlFor="report-found">Found</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Subject Type */}
        <div>
          <Label htmlFor="subjectType">Subject Type</Label>
          <RadioGroup value={subjectType} onValueChange={(value: 'PERSON' | 'ITEM') => setSubjectType(value)} className="flex space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ITEM" id="subject-item" />
              <Label htmlFor="subject-item">Item</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PERSON" id="subject-person" />
              <Label htmlFor="subject-person">Person</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Conditional Fields based on Subject Type */}
        {subjectType === 'ITEM' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="itemName">Item Name</Label>
              <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="itemColor">Item Color</Label>
              <Input id="itemColor" value={itemColor} onChange={(e) => setItemColor(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="itemBrand">Item Brand (Optional)</Label>
              <Input id="itemBrand" value={itemBrand} onChange={(e) => setItemBrand(e.target.value)} />
            </div>
          </div>
        )}

        {subjectType === 'PERSON' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="personName">Person Name (Optional)</Label>
              <Input id="personName" value={personName} onChange={(e) => setPersonName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="personAge">Person Age (Optional)</Label>
              <Input id="personAge" type="number" value={personAge} onChange={(e) => setPersonAge(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="guardianContact">Guardian Contact (Optional)</Label>
              <Input id="guardianContact" value={guardianContact} onChange={(e) => setGuardianContact(e.target.value)} />
            </div>
            <div className="md:col-span-3"> {/* Span across columns */}
              <div className="flex items-center space-x-2">
                <Input
                  id="isChild"
                  type="checkbox"
                  checked={isChild}
                  onChange={(e) => setIsChild(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isChild">Is this a child (under 18)?</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="heightCm">Height (cm) (Optional)</Label>
              <Input id="heightCm" type="number" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="weightKg">Weight (kg) (Optional)</Label>
              <Input id="weightKg" type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
            <div className="md:col-span-2"> {/* This input can span two columns */}
              <Label htmlFor="identifyingFeatures">Identifying Features (Optional)</Label>
              <Textarea id="identifyingFeatures" value={identifyingFeatures} onChange={(e) => setIdentifyingFeatures(e.target.value)} />
            </div>
            <div className="md:col-span-2"> {/* This input can span two columns */}
              <Label htmlFor="clothingDescription">Clothing Description (Optional)</Label>
              <Textarea id="clothingDescription" value={clothingDescription} onChange={(e) => setClothingDescription(e.target.value)} />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        {/* Language */}
        <div>
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Marathi">Marathi</SelectItem>
              <SelectItem value="Bhojpuri">Bhojpuri</SelectItem>
              <SelectItem value="Bengali">Bengali</SelectItem>
              <SelectItem value="Tamil">Tamil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" type="number" step="0.000001" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" type="number" step="0.000001" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="locationDescription">Location Description (Optional)</Label>
          <Input id="locationDescription" value={locationDescription} onChange={(e) => setLocationDescription(e.target.value)} />
        </div>
        <Button type="button" variant="outline" onClick={async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLatitude(position.coords.latitude.toString());
                        setLongitude(position.coords.longitude.toString());
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        setError("Failed to get current location. Please enter manually.");
                    }
                );
            } else {
                setError("Geolocation is not supported by your browser. Please enter location manually.");
            }
        }} className="w-full flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" /> Get Current Location
        </Button>

        {/* Photos */}
        <div>
          <Label htmlFor="photos">Photos (Optional)</Label>
          <Input id="photos" type="file" multiple accept="image/*" onChange={(e) => setPhotos(e.target.files)} />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </div>
  );
}
