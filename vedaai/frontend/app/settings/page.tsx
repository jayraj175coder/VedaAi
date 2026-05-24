'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, CheckCircle2, AlertCircle, User, Lock } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import Navbar from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/api'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [profile, setProfile] = useState({ name: user?.name || '', school: user?.school || '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const saveProfile = async () => {
    setSavingProfile(true); setProfileMsg(null)
    try {
      const res = await authService.updateProfile(profile)
      updateUser(res.user)
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' })
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update' })
    } finally { setSavingProfile(false) }
  }

  const savePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' }); return
    }
    if (passwords.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return
    }
    setSavingPw(true); setPwMsg(null)
    try {
      await authService.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      setPwMsg({ type: 'success', text: 'Password changed successfully' })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' })
    } finally { setSavingPw(false) }
  }

  return (
    <AppLayout>
      <Navbar title="Settings" />
      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        {/* Profile */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <User size={18} className="text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-900">Profile Information</h2>
          </div>

          {profileMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-xl mb-4 ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {profileMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {profileMsg.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email</label>
              <input type="email" value={user?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">School Name</label>
              <input type="text" value={profile.school} onChange={e => setProfile({ ...profile, school: e.target.value })} className="input-field" placeholder="Your school name" />
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={saveProfile} disabled={savingProfile} className="btn-primary mt-5">
            {savingProfile ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Profile</>}
          </motion.button>
        </div>

        {/* Password */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <Lock size={18} className="text-orange-600" />
            </div>
            <h2 className="font-bold text-gray-900">Change Password</h2>
          </div>

          {pwMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-xl mb-4 ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {pwMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {pwMsg.text}
            </div>
          )}

          <div className="space-y-4">
            {[
              { label: 'Current Password', field: 'currentPassword' as const },
              { label: 'New Password', field: 'newPassword' as const },
              { label: 'Confirm New Password', field: 'confirmPassword' as const },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">{label}</label>
                <input type="password" value={passwords[field]}
                  onChange={e => setPasswords({ ...passwords, [field]: e.target.value })}
                  className="input-field" placeholder="••••••••" />
              </div>
            ))}
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={savePassword} disabled={savingPw} className="btn-primary mt-5">
            {savingPw ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Change Password</>}
          </motion.button>
        </div>
      </div>
    </AppLayout>
  )
}
