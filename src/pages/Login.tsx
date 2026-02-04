import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Hotel, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppDispatch } from '@/hooks/useAppStore';
import { setCredentials, setLoading, setError } from '@/features/auth/authSlice';
import { mockUsers } from '@/utils/mockData';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    dispatch(setLoading(true));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock authentication - check if email matches any user
    const user = mockUsers.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (user && data.password === 'password') {
      dispatch(
        setCredentials({
          user,
          token: `mock-jwt-token-${user.id}-${Date.now()}`,
        })
      );
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.name}`,
      });
      navigate('/dashboard');
    } else {
      dispatch(setError('Invalid email or password'));
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Try: admin@grandhotel.com / password',
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
    dispatch(setLoading(false));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent">
              <Hotel className="h-8 w-8 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold">Grand Hotel</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Hotel Management<br />
              <span className="text-accent">Made Simple</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Streamline your operations with our comprehensive hotel management system. 
              Manage bookings, rooms, guests, and staff all in one place.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-sm text-primary-foreground/70">Hotels Trust Us</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">99.9%</div>
              <div className="text-sm text-primary-foreground/70">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-primary-foreground/70">Support</div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/4 -right-16 w-48 h-48 rounded-full bg-accent/20 blur-2xl" />
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-accent">
              <Hotel className="h-6 w-6 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">Grand Hotel</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" {...register('rememberMe')} />
                <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-accent hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground text-center mb-2">
              Demo credentials:
            </p>
            <div className="space-y-1 text-sm text-center">
              <p><strong>Admin:</strong> admin@grandhotel.com</p>
              <p><strong>Manager:</strong> manager@grandhotel.com</p>
              <p><strong>Reception:</strong> reception@grandhotel.com</p>
              <p className="text-muted-foreground">Password: password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
