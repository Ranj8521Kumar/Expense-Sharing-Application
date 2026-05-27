import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Wallet } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import styles from './AuthPage.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await authApi.login(data);
      const { user, token } = res.data.data;
      setAuth(user, token);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      {/* Left — brand panel */}
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
            Smart expense sharing for groups. Track, split, and settle with precision.
          </p>

          <div className={styles.features}>
            {['Smart split algorithms', 'Real-time balance tracking', 'Automated settlement'].map((f, i) => (
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

          {/* Decorative balance display */}
          <motion.div
            className={styles.demoCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className={styles.demoLabel}>Your net balance</div>
            <div className={styles.demoAmount}>₹2,450.00</div>
            <div className={styles.demoSub}>across 3 groups</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right — form panel */}
      <div className={styles.formPanel}>
        <motion.div
          className={styles.formBox}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSub}>Sign in to your SplitLedger account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <Input
              label="Email"
              id="login-email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <Input
              label="Password"
              id="login-password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

            {serverError && (
              <div className={styles.serverError}>{serverError}</div>
            )}

            <Button type="submit" fullWidth loading={isSubmitting} size="lg">
              Sign In
            </Button>
          </form>

          <p className={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.switchLink}>Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
