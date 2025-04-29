"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"
import Cookies from "js-cookie"

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    usertype: "resident",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authAPI.login(loginData)

      // Store user data in localStorage for client-side auth
      localStorage.setItem("user", JSON.stringify(response.user))

      // Also store in cookies for middleware
      Cookies.set("user", JSON.stringify(response.user), { expires: 7 })

      toast({
        title: "Login Successful",
        description: "Welcome to Smart Waste Management System",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await authAPI.register({
        firstname: registerData.firstname,
        lastname: registerData.lastname,
        email: registerData.email,
        phone: registerData.phone,
        address: registerData.address,
        usertype: registerData.usertype,
        password: registerData.password,
      })

      toast({
        title: "Registration Successful",
        description: "Please login with your credentials",
      })
      setRegisterData({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        address: "",
        usertype: "resident",
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">Smart Waste Management System</h1>
          <p className="text-gray-600 mt-2">Efficient, Sustainable, Smart</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      value={loginData.email}
                      onChange={handleLoginChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={loginData.password}
                      onChange={handleLoginChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">First Name</Label>
                      <Input
                        id="firstname"
                        name="firstname"
                        required
                        value={registerData.firstname}
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name</Label>
                      <Input
                        id="lastname"
                        name="lastname"
                        required
                        value={registerData.lastname}
                        onChange={handleRegisterChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={registerData.email}
                      onChange={handleRegisterChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      required
                      value={registerData.address}
                      onChange={handleRegisterChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usertype">User Type</Label>
                    <select
                      id="usertype"
                      name="usertype"
                      className="w-full p-2 border rounded-md"
                      value={registerData.usertype}
                      onChange={(e) => setRegisterData({ ...registerData, usertype: e.target.value })}
                    >
                      <option value="resident">Resident</option>
                      <option value="admin">Admin</option>
                      <option value="collector">Waste Collector</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={registerData.password}
                      onChange={handleRegisterChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
