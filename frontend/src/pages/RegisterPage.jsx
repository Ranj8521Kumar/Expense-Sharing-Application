import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Wallet } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import styles from './AuthPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await authApi.register(data);
      const { user, token } = res.data.data;
      setAuth(user, token);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      {/* Left brand panel */}
      <div className={styles.brand}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.brandContent}
        >
          <div className={styles.brandLogo}>
            <Wallet size={28} />
          </div>
          <h1 className={styles.brandTitle}>SplitLedger</h1>
          <p className={styles.brandTagline}>
            Join thousands of groups managing shared expenses with precision.
          </p>

          <div className={styles.features}>
            {['No more awkward money talks', 'Equal, exact, or % splits', 'Instant settlement suggestions'].map((f, i) => (
              <motion.div
                key={f}
                className={styles.feature}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className={styles.featureDot} />
                <span>{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div className={styles.formPanel}>
        <motion.div
          className={styles.formBox}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create account</h2>
            <p className={styles.formSub}>Start splitting expenses smarter</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <Input
              label="Full Name"
              id="reg-name"
              type="text"
              placeholder="John Doe"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />

            <Input
              label="Email"
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <Input
              label="Password"
              id="reg-password"
              type="password"
              placeholder="Min. 6 characters"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
            />

            <Input
              label="Phone (optional)"
              id="reg-phone"
              type="tel"
              placeholder="+91 98765 43210"
              leftIcon={<Phone size={16} />}
              {...register('phone')}
            />

            {serverError && (
              <div className={styles.serverError}>{serverError}</div>
            )}

            <Button type="submit" fullWidth loading={isSubmitting} size="lg">
              Create Account
            </Button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.switchLink}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
