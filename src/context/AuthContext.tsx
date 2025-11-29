import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    AuthError,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const clearError = () => setError(null);

    const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
        setError(null);

        setError(null);

        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const authError = err as AuthError;
            console.error("Login error:", authError);
            setError(mapAuthErrorToMessage(authError.code));
            throw err;
        }
    };

    const signUp = async (email: string, password: string) => {
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const authError = err as AuthError;
            console.error("Signup error:", authError);
            setError(mapAuthErrorToMessage(authError.code));
            throw err;
        }
    };

    const logOut = async () => {
        setError(null);
        try {
            await signOut(auth);
            setUser(null); // Explicitly clear user state for bypass users
        } catch (err) {
            console.error("Logout error:", err);
            setError("Error al cerrar sesión");
            throw err;
        }
    };

    const resetPassword = async (email: string) => {
        setError(null);
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (err) {
            const authError = err as AuthError;
            console.error("Reset password error:", authError);
            setError(mapAuthErrorToMessage(authError.code));
            throw err;
        }
    };

    const mapAuthErrorToMessage = (errorCode: string): string => {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'El correo electrónico no es válido.';
            case 'auth/user-disabled':
                return 'Este usuario ha sido deshabilitado.';
            case 'auth/user-not-found':
                return 'No se encontró ninguna cuenta con este correo.';
            case 'auth/wrong-password':
                return 'La contraseña es incorrecta.';
            case 'auth/email-already-in-use':
                return 'Lo sentimos, pero parece que esta persona ya ha sido registrada.';
            case 'auth/weak-password':
                return 'La contraseña debe tener al menos 6 caracteres.';
            case 'auth/missing-password':
                return 'Por favor ingresa una contraseña.';
            case 'auth/invalid-credential':
                return 'Credenciales inválidas. Verifica tu usuario y contraseña.';
            default:
                return `Ocurrió un error (${errorCode}). Por favor intenta de nuevo.`;
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        logOut,
        resetPassword,
        error,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
