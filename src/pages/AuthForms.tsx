import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, AtSign, School, Info, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSignIn, useSignUp, useAuth } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

// Previous interfaces remain the same
interface FormData {
  email?: string;
  username?: string;
  password: string;
  name?: string;
}

interface ValidationState {
  email: {
    valid: boolean;
    message: string;
  };
  password: {
    valid: boolean;
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

const AuthForms: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "username">("email");
  const [validation, setValidation] = useState<ValidationState>({
    email: { valid: true, message: "" },
    password: {
      valid: true,
      hasMinLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    },
  });
  
  const navigate = useNavigate();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();

  // Check if user is already signed in
  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      // User is already signed in, redirect to dashboard
      navigate('/dashboard');
    }
  }, [isAuthLoaded, isSignedIn, navigate]);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    setValidation(prev => ({
      ...prev,
      email: {
        valid: isValid,
        message: isValid ? "" : "Please enter a valid email address"
      }
    }));
    
    return isValid;
  };

  // Password validation
  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    
    setValidation(prev => ({
      ...prev,
      password: {
        valid: isValid,
        hasMinLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar
      }
    }));
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    
    // Validate password
    const isPasswordValid = validatePassword(password);
    
    // Validate email if needed
    let isEmailValid = true;
    if (!isLogin || authMethod === "email") {
      const email = formData.get("email") as string;
      isEmailValid = validateEmail(email);
    }
    
    if (!isPasswordValid || !isEmailValid) {
      return; // Don't proceed if validation fails
    }
    
    setLoading(true);

    const data: FormData = {
      password,
    };

    try {
      if (isLogin) {
        data[authMethod] = formData.get(authMethod) as string;
        
        if (!isSignInLoaded) {
          throw new Error("Sign-in is not available");
        }
        
        // First check if a session already exists and sign out if needed
        if (isSignedIn) {
          await signIn?.destroy();
        }
        
        const result = await signIn?.create({
          identifier: data[authMethod]!,
          password: data.password,
        });
        
        if (result?.status === "complete") {
          // Set active session
          await setSignInActive({ session: result.createdSessionId });
          navigate('/dashboard');
        } else if (result?.status === "needs_second_factor") {
          // Handle 2FA if needed
          setError("Two-factor authentication required");
        } else if (result?.status === "needs_identifier") {
          setError("Please provide your email or username");
        } else if (result?.status === "needs_new_password") {
          setError("You need to update your password");
        }
      } else {
        data.name = formData.get("name") as string;
        data.email = formData.get("email") as string;
        
        if (!isSignUpLoaded) {
          throw new Error("Sign-up is not available");
        }
        
        // First check if a session already exists and sign out if needed
        if (isSignedIn) {
          await signUp?.destroy();
        }
        
        const result = await signUp?.create({
          emailAddress: data.email!,
          password: data.password,
          firstName: data.name?.split(' ')[0],
          lastName: data.name?.split(' ').slice(1).join(' ') || '',
        });
        
        if (result?.status === "complete") {
          // Set active session
          await setSignUpActive({ session: result.createdSessionId });
          navigate('/dashboard');
        } else if (result?.status === "needs_email_verification") {
          setError("Please check your email to verify your account");
        }
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || (isLogin ? "Authentication failed" : "Sign up failed");
      setError(errorMessage);
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Check if a session already exists and sign out if needed
      if (isSignedIn) {
        if (isLogin && isSignInLoaded) {
          await signIn?.destroy();
        } else if (!isLogin && isSignUpLoaded) {
          await signUp?.destroy();
        }
      }
      
      if (isLogin) {
        if (!isSignInLoaded) {
          throw new Error("Sign-in is not available");
        }
        
        await signIn?.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/dashboard",
          redirectUrlComplete: "/dashboard"
        });
      } else {
        if (!isSignUpLoaded) {
          throw new Error("Sign-up is not available");
        }
        
        await signUp?.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/dashboard",
          redirectUrlComplete: "/dashboard"
        });
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Google authentication failed");
      console.error("Google auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add Clerk CAPTCHA element
  useEffect(() => {
    // Create the clerk-captcha element if it doesn't exist
    if (!document.getElementById('clerk-captcha')) {
      const captchaElement = document.createElement('div');
      captchaElement.id = 'clerk-captcha';
      captchaElement.style.display = 'none'; // Hide it visually but keep it in DOM
      document.body.appendChild(captchaElement);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      validateEmail(value);
    } else if (name === "password") {
      validatePassword(value);
    }
  };

  const fillDemoCredentials = () => {
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement | null;
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement | null;
    if (emailInput && passwordInput) {
      emailInput.value = "testuser@gmail.com";
      passwordInput.value = "bc.v6p_DTbvZ;Ek";
      validateEmail("testuser@gmail.com");
      validatePassword("bc.v6p_DTbvZ;Ek");
    }
  };

  // If already signed in, show loading or redirect
  if (isAuthLoaded && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              <p>You're already signed in. Redirecting to dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  <p>Email: testuser@gmail.com</p>
                  <p>Password: bc.v6p_DTbvZ;Ek</p>
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
            {isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Sign in with</label>
                <div className="flex space-x-4">
                  {(["email", "username"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setAuthMethod(method)}
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

            {(!isLogin || authMethod === "email") && (
              <div className="space-y-2 transform transition-all duration-500">
                <label className="text-sm font-medium">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                  <input
                    name="email"
                    type="email"
                    required
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 ${
                      !validation.email.valid && "border-red-500"
                    }`}
                    placeholder="you@example.com"
                  />
                  {!validation.email.valid && (
                    <p className="text-xs text-red-500 mt-1">{validation.email.message}</p>
                  )}
                </div>
              </div>
            )}

            {isLogin && authMethod === "username" && (
              <div className="space-y-2 transform transition-all duration-500">
                <label className="text-sm font-medium">Username</label>
                <div className="relative group">
                  <AtSign className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-500" />
                  <input
                    name="username"
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300"
                    placeholder="username"
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
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 ${
                    !validation.password.valid && !isLogin && "border-red-500"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password strength meter */}
              {!isLogin && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs font-medium text-gray-600">Password strength:</p>
                  <ul className="space-y-1">
                    <li className="text-xs flex items-center gap-1">
                      {validation.password.hasMinLength ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-red-500" />
                      )}
                      <span>At least 8 characters</span>
                    </li>
                    <li className="text-xs flex items-center gap-1">
                      {validation.password.hasUpperCase ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-red-500" />
                      )}
                      <span>At least one uppercase letter</span>
                    </li>
                    <li className="text-xs flex items-center gap-1">
                      {validation.password.hasLowerCase ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-red-500" />
                      )}
                      <span>At least one lowercase letter</span>
                    </li>
                    <li className="text-xs flex items-center gap-1">
                      {validation.password.hasNumber ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-red-500" />
                      )}
                      <span>At least one number</span>
                    </li>
                    <li className="text-xs flex items-center gap-1">
                      {validation.password.hasSpecialChar ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-red-500" />
                      )}
                      <span>At least one special character</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="animate-shake">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div id='clerk-captcha' />
            <button
              type="submit"
              disabled={loading || (!isLogin && !validation.password.valid)}
              className={`w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                loading || (!isLogin && !validation.password.valid) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            {/* Google Sign-In/Sign-Up Button */}
            <div className="relative text-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-sm text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className={`w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.31 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{isLogin ? "Sign in with Google" : "Sign up with Google"}</span>
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
