import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ChevronDown, Shield, Users, Clock, FileText, CheckCircle, ArrowRight, Lock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import SignaturePadPersistent from "@/components/signature-pad-persistent";
import CloudFileUpload from "@/components/cloud-file-upload";
import { countryCodes, countries } from "@shared/schema";

const guestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
});

const checkInSchema = z.object({
  // Guest details
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  phoneCountryCode: z.string().min(1, "Country code is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  country: z.string().min(1, "Country is required"),
  
  // Arrival & departure
  arrivalDate: z.string().min(1, "Arrival date is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  arrivalNotes: z.string().optional(),
  departureDate: z.string().min(1, "Departure date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  
  // Guests
  guests: z.array(guestSchema).min(1, "At least one guest is required"),
  
  // Terms
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type CheckInForm = z.infer<typeof checkInSchema>;

export default function CheckInPage() {
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "lead-guest": true,
  });
  const [guests, setGuests] = useState([{ firstName: "", lastName: "", phone: "", email: "" }]);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [identityFileInfo, setIdentityFileInfo] = useState<{
    url: string;
    name: string;
    size: number;
    type: string;
  } | null>(null);

  const form = useForm<CheckInForm>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      guests: [{ firstName: "", lastName: "", phone: "", email: "" }],
      termsAccepted: false,
      arrivalTime: "15:00",
      departureTime: "09:00",
    },
    shouldFocusError: false,
  });
  
  // Parse URL parameters for pre-fill functionality
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    async function loadPreFillData() {
      let preFillData: Partial<CheckInForm> = {};
      let isVerified = false;
      
      // Priority 1: Check for signed token (most secure)
      const signedToken = urlParams.get('token');
      if (signedToken) {
        try {
          const response = await fetch('/api/verify-prefill-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: signedToken })
          });
          
          if (response.ok) {
            const result = await response.json();
            preFillData = result.data;
            isVerified = result.verified;
            console.log('Pre-filling form from verified token:', preFillData);
          } else {
            // Token verification failed - show error and prevent any pre-fill
            toast({
              title: "Invalid Link",
              description: "This pre-filled link has been tampered with or is invalid. Please contact the sender for a new link.",
              variant: "destructive"
            });
            // Don't try other pre-fill methods - explicitly halt
            return;
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
          toast({
            title: "Error Loading Link",
            description: "Unable to load the pre-filled link. Please try again or contact the sender.",
            variant: "destructive"
          });
          // Don't try other pre-fill methods - explicitly halt
          return;
        }
      }
      // Priority 2: Check for individual query parameters (fallback)
      else {
        const dataToken = urlParams.get('data');
        
        // Unsigned 'data' tokens are deprecated for security reasons
        if (dataToken) {
          toast({
            title: "Deprecated Link Format",
            description: "This link uses an old unsigned format. Please request a new secure link from the sender.",
            variant: "destructive"
          });
          return;
        }
        
        // Priority 3: Check for individual query parameters
        const firstName = urlParams.get('firstName');
        const lastName = urlParams.get('lastName');
        const email = urlParams.get('email');
        const phone = urlParams.get('phone');
        const phoneCountryCode = urlParams.get('phoneCountryCode');
        const dateOfBirth = urlParams.get('dateOfBirth');
        const country = urlParams.get('country');
        const arrivalDate = urlParams.get('arrivalDate');
        const arrivalTime = urlParams.get('arrivalTime');
        const departureDate = urlParams.get('departureDate');
        const departureTime = urlParams.get('departureTime');
        
        if (firstName) preFillData.firstName = firstName;
        if (lastName) preFillData.lastName = lastName;
        if (email) preFillData.email = email;
        if (phone) preFillData.phone = phone;
        if (phoneCountryCode) preFillData.phoneCountryCode = phoneCountryCode;
        if (dateOfBirth) preFillData.dateOfBirth = dateOfBirth;
        if (country) preFillData.country = country;
        if (arrivalDate) preFillData.arrivalDate = arrivalDate;
        if (arrivalTime) preFillData.arrivalTime = arrivalTime;
        if (departureDate) preFillData.departureDate = departureDate;
        if (departureTime) preFillData.departureTime = departureTime;
        
        if (Object.keys(preFillData).length > 0) {
          console.log('Pre-filling form from URL params:', preFillData);
        }
      }
      
      // Apply pre-fill data to form
      if (Object.keys(preFillData).length > 0) {
        Object.entries(preFillData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            form.setValue(key as keyof CheckInForm, value as any);
          }
        });
        
        toast({
          title: isVerified ? "Form Pre-filled (Verified)" : "Form Pre-filled",
          description: "The form has been filled with your information. Please review and update as needed.",
        });
      }
    }
    
    loadPreFillData();
  }, []);
  
  // Prevent unwanted scroll behavior
  useEffect(() => {
    let currentScroll = window.scrollY;
    
    const preventScrollToTop = () => {
      const newScroll = window.scrollY;
      
      // If we suddenly jumped to top (scroll went from >100 to 0), restore position
      if (currentScroll > 100 && newScroll === 0) {
        console.log('Prevented scroll to top, restoring to:', currentScroll);
        window.scrollTo({ top: currentScroll, behavior: 'instant' });
        return;
      }
      
      currentScroll = newScroll;
    };

    // Check scroll position very frequently
    const interval = setInterval(preventScrollToTop, 10);
    window.addEventListener('scroll', preventScrollToTop);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', preventScrollToTop);
    };
  }, []);
  
  const handleSignatureChange = useCallback((signature: string | null) => {
    console.log('Parent handleSignatureChange called with signature length:', signature?.length || 0);
    setSignatureData(signature);
  }, []);
  
  const handleFileUploaded = useCallback((fileUrl: string, fileName: string, fileSize: number, fileType: string) => {
    console.log('Parent handleFileUploaded called with:', { fileUrl, fileName, fileSize, fileType });
    if (fileUrl && fileName) {
      setIdentityFileInfo({ url: fileUrl, name: fileName, size: fileSize, type: fileType });
    } else {
      setIdentityFileInfo(null);
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: CheckInForm) => {
      const formData = new FormData();
      
      const submitData = {
        ...data,
        termsAccepted: data.termsAccepted ? "true" : "false",
        submittedAt: new Date().toISOString(),
      };
      
      formData.append('data', JSON.stringify(submitData));

      // Submit to internal API first
      const response = await fetch('/api/check-ins', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit check-in');
      }

      const result = await response.json();

      // Send to Azure Logic Apps webhook
      try {
        // Convert relative URL to complete URL for webhook
        const fullIdentityFileUrl = identityFileInfo?.url 
          ? `${window.location.origin}${identityFileInfo.url}`
          : null;

        const webhookData = {
          ...submitData,
          identityFileUrl: fullIdentityFileUrl,
          identityFileName: identityFileInfo?.name || null,
          identityFileSize: identityFileInfo?.size || null,
          identityFileType: identityFileInfo?.type || null,
          signatureImageData: signatureData || null,
        };
        
        console.log('Debug - identityFileInfo:', identityFileInfo);
        console.log('Debug - fullIdentityFileUrl:', fullIdentityFileUrl);
        console.log('Debug - signatureData length:', signatureData?.length || 0);

        console.log('Sending webhook data:', webhookData);
        console.log('Exact JSON being sent to webhook:', JSON.stringify(webhookData, null, 2));
        
        const webhookResponse = await fetch('https://prod-03.westus.logic.azure.com:443/workflows/fc307344b6db4d4ca57a0e40dd794ca8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=J-m90Ua98MJkYH7Kh8D7nr4ydsYbcNZfS7qAacum6XU', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });

        console.log('Webhook response status:', webhookResponse.status);
        if (webhookResponse.ok) {
          console.log('Webhook submission successful');
        } else {
          const errorText = await webhookResponse.text();
          console.error('Webhook submission failed with status:', webhookResponse.status, 'Error:', errorText);
        }
      } catch (webhookError) {
        console.error('Webhook submission failed:', webhookError);
        // Don't fail the entire submission if webhook fails
      }

      return result;
    },
    onSuccess: () => {
      // Clear the form
      form.reset();
      
      // Reset additional state
      setGuests([{ firstName: "", lastName: "", phone: "", email: "" }]);
      setSignatureData(null);
      setIdentityFileInfo(null);
      
      // Reset accordion sections to initial state
      setOpenSections({
        "lead-guest": true,
      });
      
      toast({
        title: "Check-in completed successfully!",
        description: "We've received your information and will be in touch soon.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error submitting check-in",
        description: error.message,
      });
    },
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddGuest = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentGuests = form.getValues("guests") || [];
    const newGuests = [...currentGuests, { firstName: "", lastName: "", phone: "", email: "" }];
    setGuests(newGuests);
    form.setValue("guests", newGuests);
  };

  const handleRemoveGuest = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    const currentGuests = form.getValues("guests") || [];
    if (currentGuests.length > 1) {
      const newGuests = currentGuests.filter((_, i) => i !== index);
      setGuests(newGuests);
      form.setValue("guests", newGuests);
    }
  };


  const onSubmit = (data: CheckInForm) => {
    console.log('Form submitted with data:', data);
    console.log('Form errors:', form.formState.errors);
    console.log('Signature data available:', !!signatureData);
    console.log('Identity file available:', !!identityFileInfo);
    
    if (!signatureData) {
      toast({
        variant: "destructive",
        title: "Signature required",
        description: "Please provide your digital signature before submitting.",
      });
      return;
    }

    mutation.mutate(data);
  };

  const AccordionSection = ({ 
    id, 
    title, 
    step, 
    children 
  }: { 
    id: string; 
    title: string; 
    step: number; 
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <Collapsible open={openSections[id]} onOpenChange={() => toggleSection(id)}>
        <CollapsibleTrigger asChild>
          <button 
            type="button" 
            className="w-full px-6 py-4 text-left focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
              </div>
              <ChevronDown 
                className={`h-5 w-5 transition-transform duration-200 ${
                  openSections[id] ? 'transform rotate-180' : ''
                }`} 
              />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 pb-6">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen" style={{ overflow: 'auto' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-700">Online Check-in</h1>
              <p className="text-gray-500 mt-1">Complete your check-in details to ensure a smooth arrival</p>
            </div>
            <div className="hidden md:flex items-center text-sm text-gray-500">
              <Shield className="h-4 w-4 text-teal-600 mr-2" />
              Secure & Encrypted
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ position: 'relative' }}>
          <Card className="bg-white rounded-xl shadow-sm border">
            <CardContent className="p-0">
              
              {/* Guest Details */}
              <AccordionSection id="lead-guest" title="Guest Details" step={1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      placeholder="Enter first name"
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      placeholder="Enter last name"
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="your.email@example.com"
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>Phone Number *</Label>
                    <div className="flex mt-2">
                      <Select 
                      value={(() => {
                        const code = form.watch("phoneCountryCode") || "";
                        // Find the first matching country for this code to create a unique value
                        const country = countryCodes.find(c => c.code === code);
                        return country ? `${code}-${country.country}` : code;
                      })()}
                      onValueChange={(value) => {
                        // Extract just the code part (before the dash)
                        const code = value.split('-')[0];
                        form.setValue("phoneCountryCode", code);
                      }}>
                        <SelectTrigger className="w-32 rounded-r-none enhanced-select">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((country) => (
                            <SelectItem key={`${country.country}-${country.code}`} value={`${country.code}-${country.country}`}>
                              {country.flag} {country.code} ({country.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        {...form.register("phone")}
                        placeholder="555-123-4567"
                        className="rounded-l-none border-l-0 enhanced-input"
                      />
                    </div>
                    {(form.formState.errors.phone || form.formState.errors.phoneCountryCode) && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.phone?.message || form.formState.errors.phoneCountryCode?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...form.register("dateOfBirth")}
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select 
                      value={form.watch("country") || ""}
                      onValueChange={(value) => form.setValue("country", value)}>
                      <SelectTrigger className="mt-2 enhanced-select">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.country && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.country.message}</p>
                    )}
                  </div>
                </div>
              </AccordionSection>

              {/* Arrival & Departure */}
              <AccordionSection id="arrival-departure" title="Arrival & Departure" step={2}>
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-800">
                    <p className="font-medium mb-2">Check-in & Check-out Information:</p>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Check-in is After 3:00 PM</strong></li>
                      <li><strong>Check-out is Before 9:00 AM</strong></li>
                    </ul>
                    <p className="mt-2 text-sm">If you wish to arrive or depart outside our operating hours, this request will be subject to availability and fees may apply and will be confirmed by our team.</p>
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="arrivalDate">Arrival Date *</Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      {...form.register("arrivalDate")}
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.arrivalDate && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.arrivalDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="arrivalTime">Arrival Time *</Label>
                    <Input
                      id="arrivalTime"
                      type="time"
                      {...form.register("arrivalTime")}
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.arrivalTime && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.arrivalTime.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="departureDate">Departure Date *</Label>
                    <Input
                      id="departureDate"
                      type="date"
                      {...form.register("departureDate")}
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.departureDate && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.departureDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="departureTime">Departure Time *</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      {...form.register("departureTime")}
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.departureTime && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.departureTime.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="arrivalNotes">Arrival Notes</Label>
                    <Textarea
                      id="arrivalNotes"
                      {...form.register("arrivalNotes")}
                      placeholder="Any special instructions or notes about your arrival..."
                      className="mt-2 enhanced-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              </AccordionSection>

              {/* Proof of Identity */}
              <AccordionSection id="identity" title="Proof of Identity" step={3}>
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <FileText className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <p className="mb-2">Please upload your government issued identity document (Driver's License or Passport).</p>
                    <p className="mb-2">Your ID is stored safely in our system and is used only for security and insurance purposes.</p>
                    <p className="font-medium">We regret that we are unable to check in guests whose identity has not been verified and can only hand over keys to the guest whose identity document has been recorded in this agreement.</p>
                  </AlertDescription>
                </Alert>

                <CloudFileUpload
                  key="identity-file-upload"
                  onFileUploaded={handleFileUploaded}
                  accept=".jpg,.jpeg,.png,.pdf"
                  uploadedFile={identityFileInfo}
                />
              </AccordionSection>

              {/* Your Guests */}
              <AccordionSection id="guests" title="Your Guests" step={4}>
                <Alert className="mb-6 border-amber-200 bg-amber-50">
                  <Users className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Please provide the full name of each guest who will be staying at the property.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  {guests.map((guest, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-700">Guest {index + 1}</h4>
                        {guests.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleRemoveGuest(index, e)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>First Name *</Label>
                          <Input
                            {...form.register(`guests.${index}.firstName`)}
                            placeholder="First name"
                            className="mt-2 enhanced-input"
                          />
                        </div>
                        <div>
                          <Label>Last Name *</Label>
                          <Input
                            {...form.register(`guests.${index}.lastName`)}
                            placeholder="Last name"
                            className="mt-2 enhanced-input"
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            {...form.register(`guests.${index}.phone`)}
                            placeholder="Phone number"
                            className="mt-2 enhanced-input"
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            {...form.register(`guests.${index}.email`)}
                            placeholder="Email address"
                            className="mt-2 enhanced-input"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddGuest}
                  className="w-full mt-4 border-dashed border-2 hover:border-red-500 hover:text-red-500"
                >
                  Add Another Guest
                </Button>
              </AccordionSection>

              {/* Terms of Acceptance */}
              <AccordionSection id="terms" title="Terms of Acceptance" step={5}>
                <Alert className="mb-6 border-gray-200 bg-gray-50">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-gray-700 font-medium">
                    No Parties • No Smoking
                  </AlertDescription>
                </Alert>

                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Digital Signature *</Label>
                  <SignaturePadPersistent 
                    onSignatureChange={handleSignatureChange} 
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={form.watch("termsAccepted")}
                    onCheckedChange={(checked) => {
                      form.setValue("termsAccepted", checked as boolean);
                    }}
                  />
                  <label 
                    onClick={(e) => {
                      e.preventDefault();
                      form.setValue("termsAccepted", !form.watch("termsAccepted"));
                    }}
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                  >
                    By signing this agreement, you acknowledge that you have read and agree to the{" "}
                    <span className="text-red-500 hover:underline">Rental Agreement</span>.
                  </label>
                </div>
                {form.formState.errors.termsAccepted && (
                  <p className="text-red-500 text-sm mt-2">{form.formState.errors.termsAccepted.message}</p>
                )}
              </AccordionSection>

            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card className="mt-8 bg-white rounded-xl shadow-sm border">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-gray-500 flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-teal-600" />
                    Your information is encrypted and secure
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold"
                >
                  {mutation.isPending ? "Submitting..." : "Complete Check-in"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
