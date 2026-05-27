import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { client } from '../api/client';
import { authApi } from '../api/auth';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({ defaultValues: { name: user?.name || '', phone: user?.phone || '' } });

  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm();

  const onProfileSave = async (data) => {
    setProfileError('');
    try {
      const res = await client.put('/users/profile', data);
      updateUser(res.data.data.user);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Update failed');
    }
  };

  const onPasswordSave = async (data) => {
    setPasswordError('');
    try {
      await authApi.updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      resetPassword();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Password update failed');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>Manage your account settings</p>
      </div>

      {/* User card */}
      <motion.div
        className={styles.userCard}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Avatar name={user?.name || ''} size={72} />
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.name}</div>
          <div className={styles.userEmail}>{user?.email}</div>
          <div className={styles.userSince}>
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'recently'}
          </div>
        </div>
      </motion.div>

      <div className={styles.sections}>
        {/* Profile info */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
          </div>

          <form onSubmit={handleProfile(onProfileSave)} className={styles.form}>
            <Input
              label="Full Name"
              id="profile-name"
              leftIcon={<User size={16} />}
              error={profileErrors.name?.message}
              {...regProfile('name', { required: 'Name is required' })}
            />
            <Input
              label="Phone"
              id="profile-phone"
              type="tel"
              leftIcon={<Phone size={16} />}
              {...regProfile('phone')}
            />
            {profileError && <div className={styles.errorMsg}>{profileError}</div>}
            {profileSuccess && <div className={styles.successMsg}>Profile updated successfully ✓</div>}
            <div className={styles.formActions}>
              <Button type="submit" loading={profileSubmitting} leftIcon={<Save size={15} />}>
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Change password */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Change Password</h2>
          </div>

          <form onSubmit={handlePassword(onPasswordSave)} className={styles.form}>
            <Input
              label="Current Password"
              id="current-password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={pwErrors.currentPassword?.message}
              {...regPassword('currentPassword', { required: 'Current password is required' })}
            />
            <Input
              label="New Password"
              id="new-password"
              type="password"
              placeholder="Min. 6 characters"
              leftIcon={<Lock size={16} />}
              error={pwErrors.newPassword?.message}
              {...regPassword('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
            />
            {passwordError && <div className={styles.errorMsg}>{passwordError}</div>}
            {passwordSuccess && <div className={styles.successMsg}>Password updated successfully ✓</div>}
            <div className={styles.formActions}>
              <Button type="submit" loading={pwSubmitting} leftIcon={<Save size={15} />}>
                Update Password
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Account info */}
        <motion.div
          className={styles.section}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Account Details</h2>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>User ID</span>
            <span className={styles.detailValue + ' mono'}>{user?._id || '—'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{user?.email || '—'}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
