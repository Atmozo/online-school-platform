import React from 'react';
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, AtSign, School, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Previous interfaces remain the same
interface FormData {
  email?: string;
  username?: string;
  password: string;
  name?: string;
}

const AuthForms = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "username">("email");

  // Handle submit function remains the same
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: FormData = {
      password: formData.get("password") as string,
    };

    if (isLogin) {
      data[authMethod] = formData.get(authMethod) as string;
    } else {
      data.name = formData.get("name") as string;
      data.email = formData.get("email") as string;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/${isLogin ? 'auth/login' : 'register'}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);

      if (result.token) {
        localStorage.setItem("token", result.token);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    if (emailInput && passwordInput) {
      emailInput.value = 'test@example.com';
      passwordInput.value = 'password123';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <Card className="w-full max-w-md transform transition-all duration-500 hover:shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full transform transition-transform duration-500 hover:rotate-12">
              <School className="h-12 w-12 text-blue-600 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {isLogin ? "Welcome back!" : "Create an account"}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Demo Credentials Notice */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 transition-all duration-300 hover:border-blue-300">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-medium text-blue-900">Try Demo Account</h3>
                <p className="text-sm text-blue-700">
                  Use these credentials to explore features:
                </p>
                <div className="text-sm text-blue-600">
                  <p>Email: test@example.com</p>
                  <p>Password: password123</p>
                </div>
                <button 
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-sm text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md transition-colors duration-300 mt-2"
                >
                  Fill Demo Credentials
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rest of the form components remain the same */}
            {isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Sign in with</label>
                <div className="flex space-x-4">
                  {["email", "username"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setAuthMethod(method as "email" | "username")}
                      className={`flex-1 py-2 border rounded-lg transition-all duration-300 transform hover:scale-105 ${
                        authMethod === method
                          ? "bg-blue-100 border-blue-500 text-blue-700 shadow-md"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2 transform transition-all duration-500">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="space-y-2 transform transition-all duration-500">
                <label className="text-sm font-medium">
                  {authMethod === "email" ? "Email" : "Username"}
                </label>
                <div className="relative group">
                  {authMethod === "email" ? (
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                  ) : (
                    <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                  )}
                  <input
                    name={authMethod}
                    type={authMethod === "email" ? "email" : "text"}
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300"
                    placeholder={authMethod === "email" ? "you@example.com" : "username"}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="animate-shake">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>

            <div className="text-center transform transition-all duration-500">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-blue-600 hover:underline font-medium">
                  {isLogin ? "Sign up" : "Sign in"}
                </span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForms;