import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { invitationsApi } from '../api/invitations';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import styles from './InviteAcceptPage.module.css';

const CATEGORY_ICONS = { trip: '✈️', home: '🏠', couple: '💑', friends: '🎉', other: '📁' };

export function InviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const res = await invitationsApi.getByToken(token);
        setInvitation(res.data.data.invitation);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invitation link');
      } finally {
        setLoading(false);
      }
    };
    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    // If not logged in → redirect to register with the token preserved
    if (!isAuthenticated) {
      navigate(`/register?invite=${token}`);
      return;
    }

    // If logged in → accept directly
    setAccepting(true);
    try {
      await invitationsApi.accept(token);
      setAccepted(true);
      setTimeout(() => navigate('/groups'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.centered}>
        <Loader size={32} className={styles.spinner} />
        <p>Loading invitation…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <div className={styles.errorCard}>
          <XCircle size={48} className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Invitation Unavailable</h2>
          <p className={styles.errorMsg}>{error}</p>
          <Link to="/login">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className={styles.centered}>
        <motion.div
          className={styles.successCard}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <CheckCircle size={56} className={styles.successIcon} />
          <h2 className={styles.successTitle}>You're in! 🎉</h2>
          <p className={styles.successMsg}>
            Welcome to <strong>{invitation.group.name}</strong>. Redirecting to your groups…
          </p>
        </motion.div>
      </div>
    );
  }

  const { group, invitedBy, expiresAt } = invitation;
  const daysLeft = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className={styles.page}>
      {/* Background glow */}
      <div className={styles.glow} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandAccent}>Split</span>Ledger
        </div>

        {/* Group badge */}
        <div className={styles.groupBadge}>
          <span className={styles.groupIcon}>
            {CATEGORY_ICONS[group.category] || '📁'}
          </span>
          <span className={styles.groupName}>{group.name}</span>
        </div>

        {/* Headline */}
        <h1 className={styles.headline}>
          <span className={styles.inviterName}>{invitedBy.name}</span> invited you to split expenses!
        </h1>

        {group.description && (
          <p className={styles.groupDesc}>{group.description}</p>
        )}

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <Users size={14} />
            <span>{group.memberCount} member{group.memberCount !== 1 ? 's' : ''}</span>
          </div>
          <div className={styles.statDot} />
          <div className={styles.stat}>
            <span style={{ textTransform: 'capitalize' }}>{group.category}</span>
          </div>
          <div className={styles.statDot} />
          <div className={styles.stat}>
            <Clock size={14} />
            <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* How it works (shown only for unauthenticated) */}
        {!isAuthenticated && (
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepText}>
                <strong>Create a free account</strong> — takes less than a minute
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepText}>
                <strong>You'll be automatically added</strong> to <strong>{group.name}</strong>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <div className={styles.stepText}>
                <strong>Start splitting expenses</strong> with your group!
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          id="accept-invite-btn"
          onClick={handleAccept}
          loading={accepting}
          style={{ width: '100%', marginTop: '8px' }}
        >
          {isAuthenticated ? `Join "${group.name}"` : 'Register & Join Group →'}
        </Button>

        {!isAuthenticated && (
          <p className={styles.loginHint}>
            Already have an account?{' '}
            <Link to={`/login?invite=${token}`} className={styles.loginLink}>Sign in</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
