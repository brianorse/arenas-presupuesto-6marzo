import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable long polling to bypass network restrictions (like corporate firewalls or specific ISPs)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMockActive = false;
    
    // Check for mock admin session (emergency bypass)
    const mockAdmin = localStorage.getItem('mock_admin_session');
    if (mockAdmin) {
      try {
        const adminData = JSON.parse(mockAdmin);
        setUser(adminData);
        setIsAdmin(true);
        setLoading(false);
        isMockActive = true;
      } catch (e) {
        console.error("Error parsing mock session:", e);
        localStorage.removeItem('mock_admin_session');
      }
    }

    // Safety timeout: if after 5 seconds we are still loading, force stop loading
    // This prevents being stuck on the loading screen if Firebase is blocked by network
    const timeoutId = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn("Auth loading timed out. Forcing stop loading.");
          return false;
        }
        return prev;
      });
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If mock is active, we IGNORE firebase auth changes to prevent being kicked out
      if (isMockActive) return;

      if (firebaseUser) {
        // Check for anonymous admin bypass
        const isAnonAdmin = firebaseUser.isAnonymous && localStorage.getItem('is_anon_admin') === 'true';

        try {
          if (isAnonAdmin) {
            setUser({
              ...firebaseUser,
              displayName: 'Admin (Anon)',
              role: 'admin',
              email: 'app@cateringapp.com'
            });
            setIsAdmin(true);
            setLoading(false);
            return;
          }

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userEmail = (firebaseUser.email || '').toLowerCase();
          const isHardcodedAdmin = userEmail === 'app@cateringapp.com' || userEmail === 'brianortegaxiv@gmail.com';

          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // If it's the hardcoded admin but the role in DB is not admin, update it
            if (isHardcodedAdmin && userData.role !== 'admin') {
              await setDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' }, { merge: true });
              userData.role = 'admin';
            }

            setUser({ ...firebaseUser, ...userData });
            setIsAdmin(userData.role === 'admin' || isHardcodedAdmin);
          } else {
            // Create profile if it doesn't exist
            const defaultRole = isHardcodedAdmin ? 'admin' : 'user';
            const newProfile = {
              uid: firebaseUser.uid,
              email: userEmail,
              displayName: firebaseUser.displayName || userEmail.split('@')[0] || 'Usuario',
              role: defaultRole,
              createdAt: serverTimestamp()
            };
            
            // Use setDoc with { merge: true } to be safe
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile, { merge: true });

            setUser({ ...firebaseUser, ...newProfile });
            setIsAdmin(defaultRole === 'admin');
          }
        } catch (err) {
          console.error("Error in AuthProvider profile check:", err);
          setUser(firebaseUser); // Fallback to basic auth user
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
