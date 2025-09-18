/**
 * MODERN LOGIN PAGE
 *
 * Agricultural ERP system login with modern design
 * Built with Shadcn components for professional appearance
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sprout,
  Tractor,
  Shield,
  CheckCircle
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Separator } from '../components/ui/separator'
import { Badge } from '../components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form'

// Context
import { useAuth } from '../contexts/AuthContext'

// =================================================================
// VALIDATION SCHEMA
// =================================================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Ungültige E-Mail-Adresse'),
  password: z
    .string()
    .min(1, 'Passwort ist erforderlich')
    .min(6, 'Passwort muss mindestens 6 Zeichen lang sein')
})

// =================================================================
// COMPONENT
// =================================================================

export default function LoginPageModern() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auth und Navigation
  const { login, devLoginAdmin, devLoginLimited, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Form Setup
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // =================================================================
  // EFFECTS
  // =================================================================

  // Automatische Weiterleitung nach erfolgreichem Login
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Login erfolgreich - Redirect zu Dashboard')
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // =================================================================
  // HANDLERS
  // =================================================================

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      const result = await login(data.email, data.password)

      if (!result.success) {
        setError(result.error)
      }
    } catch (_err) {
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Demo-Login mit Admin-Rechten
   */
  const handleAdminLogin = () => {
    console.log('Admin Login - Alle Module sichtbar')
    devLoginAdmin()
  }

  /**
   * Demo-Login mit eingeschränkten Rechten
   */
  const handleLimitedLogin = () => {
    console.log('Limited Login - Nur ausgewählte Module sichtbar')
    devLoginLimited()
  }

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="bg-green-600 rounded-full p-3">
              <Sprout className="h-8 w-8 text-white" />
            </div>
            <div className="bg-blue-600 rounded-full p-3">
              <Tractor className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            BEPWI Agricultural ERP
          </h1>
          <p className="text-gray-600">
            Moderne Landwirtschaftsverwaltung
          </p>
        </div>

        {/* Demo Login Section - Development Only */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Demo-Zugang
            </CardTitle>
            <CardDescription>
              Für Entwicklung und Demonstration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={handleAdminLogin}
                className="w-full border-green-600 text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Administrator Demo
              </Button>
              <p className="text-xs text-gray-600 text-center">
                Vollzugriff auf alle Module
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={handleLimitedLogin}
                className="w-full border-orange-600 text-orange-700 hover:bg-orange-50"
              >
                <User className="mr-2 h-4 w-4" />
                Benutzer Demo
              </Button>
              <p className="text-xs text-gray-600 text-center">
                Eingeschränkte Berechtigung
              </p>
            </div>

            <div className="text-center pt-2">
              <Badge variant="secondary" className="text-xs">
                Offline-fähig für Demo-Zwecke
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Anmeldung</CardTitle>
            <CardDescription>
              Melden Sie sich mit Ihren Zugangsdaten an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail-Adresse</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            placeholder="ihre.email@beispiel.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passwort</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Ihr Passwort"
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird angemeldet...
                    </>
                  ) : (
                    'Anmelden'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <Sprout className="h-6 w-6 mx-auto" />
                <p className="text-sm font-medium">Pflanzenmanagement</p>
              </div>
              <div className="space-y-1">
                <Tractor className="h-6 w-6 mx-auto" />
                <p className="text-sm font-medium">Fuhrparkverwaltung</p>
              </div>
            </div>
            <p className="text-center text-sm mt-4 opacity-90">
              Vollständige Landwirtschaftsverwaltung
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 BEPWI Agricultural ERP System</p>
          <p>Moderne Technologie für die Landwirtschaft</p>
        </div>
      </div>
    </div>
  )
}