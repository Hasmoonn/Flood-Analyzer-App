"use client";

import { Camera, Globe, ImageIcon, Loader2, Map, MapPin, Shield, TrendingUp, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react'
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Separator } from "@/components/ui/separator"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';

interface FloodRiskData {
  riskLevel: "Low" | "Medium" | "High" | "Very High";
  description: string;
  recommendations: string[];
  elevation: number;
  distanceFromWater: number;
}

const Page = () => {

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");

  const [inputLat, setInputLat] = useState("");
  const [inputLng, setInputLng] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  const [floodRisk, setFloodRisk] = useState<FloodRiskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<"coordinates" | "image">("coordinates");

  const [map, setMap] = useState<null>(null);
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // api calls 
  const callAPI = async (endpoint: string, data: any) => {
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: endpoint.includes("coordinates") ? {"Content-Type": "application/json"} : {},
      body: endpoint.includes("coordinates") ? JSON.stringify(data) : data,
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if ( file.size > 10 * 1024 * 1024 || !file.type.startsWith("image/") ) {
        setAlertMessage("File must be an image and less than 10MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        
        {/* header  */}
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center mb-4'>
            <div className='p-3 bg-blue-100 rounded-full mr-4'>
              <Globe className='h-8 w-8 text-blue-600' />
            </div>

            <h1 className='text-3xl font-bold text-slate-900'>Flood Detection System</h1>

            
          </div>
          
          <p className='text-slate-600'>
            Analyze flood risk using coordinates or upload images for Al-powered terrain analysis
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 rounded-md'>
          {/* input sections */}  
          {/* card  */}
          <Card className='shadow-lg border-none bg-white/70 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5 text-blue-600'/>
                Analysis Method
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="coordinates">
                <TabsList>
                  <TabsTrigger value='coordinates' className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4'/> Coordinates
                  </TabsTrigger>
                  <TabsTrigger value='image' className='flex items-center gap-2'>
                    <ImageIcon className='h-4 w-4'/> Image Analysis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='coordinates' className='mt-4 space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='latitude'>Latitude</Label>
                      <Input type='number' id='latitude' placeholder='Enter latitude' />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='longitude'>Longitude</Label>
                      <Input type='number' id='longitude' placeholder='Enter longitude' />
                    </div>
                  </div>

                  {/* button */}
                  <Button className='w-full'>
                    <MapPin className='h-4 w-4'  />
                    Analyze Coordinates
                  </Button>
                </TabsContent>

                <TabsContent value='image' className='mt-4 space-y-4'>
                  <div className='space-y-4'>
                    <div className='border-2 border-dashed border-slate-300 rounded-lg p-6 text-center'>
                      <Input ref={fileInputRef} type='file' accept='image/*' onChange={handleImageUpload} className='hidden' />

                      {!imagePreview ? (
                        <div className='space-y-4'>
                          <Upload className='h-12 w-12 mx-auto text-slate-400'/>

                          <div>
                            <p className='text-sm font-medium text-slate-700'>
                              Upload terrain image
                            </p>

                            <p className='text-xs mt-1 text-slate-500'>
                              JPG, PNG, or GIF up to 10MB
                            </p>
                          </div>

                          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                            <Camera className='h-4 w-4 mr-2' />
                            Choose Image
                          </Button>
                        </div>
                      ) : (
                        <div className='space-y-4'>
                          <img src={imagePreview} alt="Preview" className='max-h-48 object-cover rounded-lg mx-auto shadow-sm' />

                          {/* button */}
                          <Button className='w-full' onClick={() => {}}>
                            <ImageIcon className='h-4 w-4 mr-2'  />
                            Analyze Image
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* result sections  */}
          <Card className='border-0 shadow-lg bg-white/80 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5 text-green-600'/>
                Risk Assessment
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Loading */}
              {isLoading && (
                <div className='flex flex-col items-center justify-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-blue-600 mb-4' />

                  <p className='text-slate-400'>
                    {
                      analysisType === "coordinates" ? "Analyzing coordinates..." : "Analyzing image..."
                    }
                  </p>
                </div>
              )}

              {/* show results  */}
              {floodRisk && !isLoading && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRiskIcon(floodRisk.riskLevel)}
                      <span className="font-semibold">Risk Level</span>
                    </div>
                    <Badge
                      variant={getRiskVariant(floodRisk.riskLevel)}
                      className="text-sm"
                    >
                      {floodRisk.riskLevel}
                    </Badge>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {floodRisk.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {floodRisk.elevation}m
                      </div>
                      <div className="text-xs text-slate-500">Elevation</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {floodRisk.distanceFromWater}m
                      </div>
                      <div className="text-xs text-slate-500">From Water</div>
                    </div>
                  </div>

                  {aiAnalysis && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-slate-700 mb-3">
                          AI Analysis
                        </h4>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">
                            {aiAnalysis}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <h4 className="font-medium text-slate-700 mb-3">
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {floodRisk.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {!floodRisk && !isLoading && (
                <div className="text-center py-12 text-slate-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>Choose an analysis method to see flood risk assessment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* map area  */}
        <Card className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Globe className='h-5 w-5 text-green-600'/>
              Interactive Map
            </CardTitle>
          </CardHeader>

          <CardContent>
            {
              mapError ? (
                <div className='w-full h-80 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center'>
                  <Map className='h-16 w-16 text-slate-300 mb-4' />
                  <h3 className='text-lg font-semibold text-slate-700 mb-2'>
                    Map Not Available
                  </h3>

                  <p className='text-slate-500 text-center max-w-md'>
                    To enable the interactive map, Set up a Google Maps API key in env. local
                  </p>
                </div>
              ) : (
                <div ref={mapRef} className='w-full h-80 rounded-lg border border-slate-200' />
              )
            }
          </CardContent>
        </Card>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Input Error</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Page;