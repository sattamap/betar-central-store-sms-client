import { createContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    browserLocalPersistence, // Import persistence types
} from "firebase/auth";
import { app } from "../firebase/firebase.config";
import useAxiosPublic from "../hooks/useAxiosPublic";

export const AuthContext = createContext(null);
const auth = getAuth(app);

const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [jwtReady, setJwtReady] = useState(false);

    const [user, setUser] = useState(null);
      const axiosPublic = useAxiosPublic();

    // Set the desired persistence type (browserLocalPersistence)
    useEffect(() => {
        const setAuthPersistence = async () => {
            try {
                // Set browserLocalPersistence for local storage persistence
                await auth.setPersistence(browserLocalPersistence);
                console.log('Persistence set to browserLocalPersistence');
            } catch (error) {
                console.error('Error setting persistence:', error);
            }
        };

        setAuthPersistence();
    }, []);

    // Function to create a new user
    const createUser = async (email, password) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Handle post-user creation actions here, e.g., updating profile, etc.
            return userCredential;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Function to sign in an existing user
    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Function to send password reset email
    const sendPassResetEmail = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
    };

    // Function to log out the user
    const logOut = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Function to update user profile
    const updateUserProfile = async (name, photo) => {
        try {
            await updateProfile(auth.currentUser, {
                displayName: name,
                photoURL: photo,
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    };

    // Handle authentication state changes
useEffect(() => {
  const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);

    if (currentUser?.email) {
      const user = { email: currentUser.email };

      axiosPublic
        .post("/jwt", user, { withCredentials: true })
        .then((res) => {
          console.log("JWT response:", res.data);
          setJwtReady(true); // Only on success
          setLoading(false);
        })
        .catch((err) => {
          console.error("JWT error:", err.response?.status, err.message);
          setJwtReady(false); // Keep false on failure
          setLoading(false);
        });
    } else {
      axiosPublic
        .post("/logout", {}, { withCredentials: true })
        .then((res) => {
          console.log("Logged out:", res.data);
          setJwtReady(false);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Logout error:", err);
          setJwtReady(false);
          setLoading(false);
        });
    }
  });

  return () => unSubscribe();
}, [axiosPublic]);




    // Inactivity auto-logout
useEffect(() => {
    if (!user) return; // Only apply for logged-in users

    let timer;
    const logoutTime = 120 * 120 * 1000; // 15 minutes inactivity

    const resetTimer = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            // Auto logout
            logOut();
            axiosPublic.post('/logout', {}, { withCredentials: true });
            alert('Logged out due to inactivity');
            window.location.href = '/';
        }, logoutTime);
    };

    // Listen to user activity events
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // Start timer

    // Cleanup on unmount or logout
    return () => {
        clearTimeout(timer);
        events.forEach(event => window.removeEventListener(event, resetTimer));
    };
}, [user, axiosPublic]);


    // Context value to provide authentication state and functions
    const authInfo = {
        loading,
        createUser,
        signIn,
        user,
        updateUserProfile,
        sendPassResetEmail,
        logOut,
        jwtReady,
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node,
};

export default AuthProvider;
