import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ChevronDown, Shield, Users, Clock, FileText, CheckCircle, ArrowRight, Lock } from "lucide-react";

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
import FileUpload from "@/components/file-upload";
import { countryCodes, countries, transportationMethods } from "@shared/schema";

const guestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
});

const checkInSchema = z.object({
  // Lead guest details
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  phoneCountryCode: z.string().min(1, "Country code is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  
  // Arrival & departure
  arrivalDate: z.string().min(1, "Arrival date is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  travelingBy: z.string().min(1, "Transportation method is required"),
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
  
  const handleSignatureChange = useCallback((signature: string | null) => {
    console.log('Parent handleSignatureChange called with signature length:', signature?.length || 0);
    setSignatureData(signature);
  }, []);
  const [identityFile, setIdentityFile] = useState<File | null>(null);

  const form = useForm<CheckInForm>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      guests: [{ firstName: "", lastName: "", phone: "", email: "" }],
      termsAccepted: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CheckInForm) => {
      const formData = new FormData();
      
      const submitData = {
        ...data,
        signatureData,
        termsAccepted: data.termsAccepted ? "true" : "false",
      };
      
      formData.append('data', JSON.stringify(submitData));
      
      if (identityFile) {
        formData.append('identityDocument', identityFile);
      }

      const response = await fetch('/api/check-ins', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit check-in');
      }

      return response.json();
    },
    onSuccess: () => {
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

  const addGuest = () => {
    const newGuests = [...guests, { firstName: "", lastName: "", phone: "", email: "" }];
    setGuests(newGuests);
    form.setValue("guests", newGuests);
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      const newGuests = guests.filter((_, i) => i !== index);
      setGuests(newGuests);
      form.setValue("guests", newGuests);
    }
  };

  const updateGuest = (index: number, field: keyof typeof guests[0], value: string) => {
    const newGuests = [...guests];
    newGuests[index] = { ...newGuests[index], [field]: value };
    setGuests(newGuests);
    form.setValue("guests", newGuests);
  };

  const onSubmit = (data: CheckInForm) => {
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
        <CollapsibleTrigger className="w-full px-6 py-4 text-left focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors">
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
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 pb-6">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="bg-white rounded-xl shadow-sm border">
            <CardContent className="p-0">
              
              {/* Lead Guest Details */}
              <AccordionSection id="lead-guest" title="Lead Guest Details" step={1}>
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
                      <Select onValueChange={(value) => {
                        const code = value.split('-')[0];
                        form.setValue("phoneCountryCode", code);
                      }}>
                        <SelectTrigger className="w-32 rounded-r-none enhanced-select">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map((country, index) => (
                            <SelectItem key={`${country.code}-${country.country}-${index}`} value={`${country.code}-${country.country}`}>
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
                    <Select onValueChange={(value) => form.setValue("country", value)}>
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
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      {...form.register("address")}
                      placeholder="123 Main Street, Apt 4B"
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.address && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                      placeholder="Enter city"
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.city && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      {...form.register("postalCode")}
                      placeholder="12345"
                      className="mt-2 enhanced-input"
                    />
                    {form.formState.errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.postalCode.message}</p>
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
                    <Label htmlFor="travelingBy">Traveling By *</Label>
                    <Select onValueChange={(value) => form.setValue("travelingBy", value)}>
                      <SelectTrigger className="mt-2 enhanced-select">
                        <SelectValue placeholder="Select transportation method" />
                      </SelectTrigger>
                      <SelectContent>
                        {transportationMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.travelingBy && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.travelingBy.message}</p>
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

              {/* Your Guests */}
              <AccordionSection id="guests" title="Your Guests" step={3}>
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
                            onClick={() => removeGuest(index)}
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
                            value={guest.firstName}
                            onChange={(e) => updateGuest(index, "firstName", e.target.value)}
                            placeholder="First name"
                            className="mt-2 enhanced-input"
                          />
                        </div>
                        <div>
                          <Label>Last Name *</Label>
                          <Input
                            value={guest.lastName}
                            onChange={(e) => updateGuest(index, "lastName", e.target.value)}
                            placeholder="Last name"
                            className="mt-2 enhanced-input"
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            value={guest.phone}
                            onChange={(e) => updateGuest(index, "phone", e.target.value)}
                            placeholder="Phone number"
                            className="mt-2 enhanced-input"
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={guest.email}
                            onChange={(e) => updateGuest(index, "email", e.target.value)}
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
                  onClick={addGuest}
                  className="w-full mt-4 border-dashed border-2 hover:border-red-500 hover:text-red-500"
                >
                  Add Another Guest
                </Button>
              </AccordionSection>

              {/* Proof of Identity */}
              <AccordionSection id="identity" title="Proof of Identity" step={4}>
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <FileText className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <p className="mb-2">Please upload your government issued identity document (Driver's License or Passport).</p>
                    <p className="mb-2">Your ID is stored safely in our system and is used only for security and insurance purposes.</p>
                    <p className="font-medium">We regret that we are unable to check in guests whose identity has not been verified and can only hand over keys to the guest whose identity document has been recorded in this agreement.</p>
                  </AlertDescription>
                </Alert>

                <FileUpload
                  onFileChange={setIdentityFile}
                  accept=".jpg,.jpeg,.png,.pdf"
                />
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
                    onCheckedChange={(checked) => form.setValue("termsAccepted", checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    By signing this agreement, you acknowledge that you have read and agree to the{" "}
                    <span className="text-red-500 hover:underline cursor-pointer">Rental Agreement</span>.
                  </Label>
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
