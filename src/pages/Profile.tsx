import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import useAuth from '@/hooks/useAuth';
import { authStore } from '@/contexts/authStore';
import { UserAPI } from '@/api/user';
import { IdentityAPI } from '@/api/identity';
import app from '@/config';
import './profile/modern-styles.css';

interface ProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    rate: number;
}

interface AvatarData {
    fullUrl?: string;
    url?: string;
    _id?: string;
    filename?: string;
    [key: string]: any;
}

const API_BASE_URL = app.baseURL;

export default function Profile() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { auth, isLogged, isReady, set, refreshUserData } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarKey, setAvatarKey] = useState(Date.now());
    const [activeTab, setActiveTab] = useState('personal-info');
    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        rate: 0,
    });

    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Document management state
    const [identity, setIdentity] = useState<any>(null);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [isUploadingDocument, setIsUploadingDocument] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState<File | null>(null);
    const documentFileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const [activeUpgradeSection, setActiveUpgradeSection] = useState<'verified' | 'certified' | null>(null);

    // Document field configurations
    const requiredDocuments = [
        {
            key: 'registreCommerceCarteAuto',
            label: 'RC/ Autres',
            description: 'Registre de commerce ou autres documents (requis avec NIF/N° Articles)',
            required: true,
        },
        {
            key: 'nifRequired',
            label: 'NIF/N° Articles',
            description: 'NIF ou Numéro d\'articles (requis avec RC/ Autres)',
            required: true,
        },
        {
            key: 'carteFellah',
            label: 'Carte Fellah',
            description: 'Carte Fellah pour agriculteurs (peut être fournie seule)',
            required: true,
        },
    ];

    const optionalDocuments = [
        {
            key: 'commercialRegister',
            label: 'Ancien Registre de commerce',
            description: 'Ancienne version du registre de commerce (si disponible)',
            required: false,
        },
        {
            key: 'carteAutoEntrepreneur',
            label: 'Carte auto-entrepreneur',
            description: 'Carte d\'auto-entrepreneur pour les activités concernées',
            required: false,
        },
        {
            key: 'nif',
            label: 'Ancien NIF',
            description: 'Version précédente du NIF (si disponible)',
            required: false,
        },
        {
            key: 'nis',
            label: 'NIS',
            description: 'Numéro d\'identification sociale',
            required: false,
        },
        {
            key: 'numeroArticle',
            label: 'Numéro d\'article',
            description: 'Numéro d\'article fiscal',
            required: false,
        },
        {
            key: 'c20',
            label: 'Certificat C20',
            description: 'Document C20',
            required: false,
        },
        {
            key: 'misesAJourCnas',
            label: 'Mises à jour CNAS/CASNOS',
            description: 'Mises à jour CNAS/CASNOS et CACOBAPT',
            required: false,
        },
        {
            key: 'last3YearsBalanceSheet',
            label: 'Bilans des 3 dernières années',
            description: 'Bilans financiers des trois dernières années',
            required: false,
        },
        {
            key: 'certificates',
            label: 'Certificats',
            description: 'Certificats professionnels ou autres documents complémentaires',
            required: false,
        },
        {
            key: 'paymentProof',
            label: 'Preuve de paiement',
            description: 'Justificatif de paiement de souscription',
            required: false,
        },
    ];

    // Initialize form data when auth.user changes
    useEffect(() => {
        if (auth.user) {
            setFormData({
                firstName: auth.user.firstName || '',
                lastName: auth.user.lastName || '',
                email: auth.user.email || '',
                phone: auth.user.phone || '',
                rate: auth.user.rate || 0,
            });
            
            // Force avatar key update when user changes to ensure fresh image
            if (auth.user.avatar || (auth.user as any).photoURL) {
                console.log('🔄 User avatar changed, updating avatar key');
                setAvatarKey(Date.now());
            }
        }
    }, [auth.user, auth.user?.avatar, (auth.user as any)?.photoURL]);

    const getAvatarUrl = (avatar: AvatarData | string): string => {
        if (typeof avatar === 'string') {
            if (avatar.startsWith('http')) {
                return avatar.replace('http://localhost:3000', API_BASE_URL.replace(/\/$/, ''));
            } else {
                const cleanPath = avatar.startsWith('/') ? avatar.substring(1) : avatar;
                return `${API_BASE_URL}/static/${cleanPath}`;
            }
        }

        if (avatar?.fullUrl) {
            return avatar.fullUrl.replace('http://localhost:3000', API_BASE_URL.replace(/\/$/, ''));
        }

        if (avatar?.url) {
            if (avatar.url.startsWith('http')) {
                return avatar.url.replace('http://localhost:3000', API_BASE_URL.replace(/\/$/, ''));
            } else {
                const cleanUrl = avatar.url.startsWith('/') ? avatar.url.substring(1) : avatar.url;
                return `${API_BASE_URL}/static/${cleanUrl}`;
            }
        }

        if (avatar?.filename) {
            return `${API_BASE_URL}/static/${avatar.filename}`;
        }

        return '/assets/images/avatar.jpg';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log('🔄 Updating profile with data:', formData);

            const response = await UserAPI.updateProfile(formData);
            console.log('✅ Profile update response:', response);

            if (response) {
                let updatedUser;

                if (response.user) {
                    updatedUser = response.user;
                } else if (response.data) {
                    updatedUser = response.data as any;
                } else {
                    updatedUser = response as any;
                }

                if (updatedUser) {
                    const currentUser = auth.user;

                    const mergedUser = {
                        ...currentUser,
                        _id: updatedUser._id || updatedUser.id || currentUser?._id,
                        firstName: updatedUser.firstName || formData.firstName || currentUser?.firstName || '',
                        lastName: updatedUser.lastName || formData.lastName || currentUser?.lastName || '',
                        email: updatedUser.email || currentUser?.email || '',
                        type: updatedUser.accountType || updatedUser.type || currentUser?.type || 'PROFESSIONAL',
                        phone: updatedUser.phone || formData.phone || currentUser?.phone,
                        avatar: updatedUser.avatar || currentUser?.avatar,
                        rate: currentUser?.rate || 1,
                        isPhoneVerified: (updatedUser as any)?.isPhoneVerified ?? (currentUser as any)?.isPhoneVerified,
                        isVerified: (updatedUser as any)?.isVerified ?? (currentUser as any)?.isVerified,
                        isCertified: (updatedUser as any)?.isCertified ?? (currentUser as any)?.isCertified ?? false,
                        isHasIdentity: currentUser?.isHasIdentity,
                        isActive: (updatedUser as any)?.isActive ?? (currentUser as any)?.isActive,
                        isBanned: (updatedUser as any)?.isBanned ?? (currentUser as any)?.isBanned,
                        photoURL: (currentUser as any)?.photoURL,
                        fullName: (currentUser as any)?.fullName,
                    };

                    console.log('👤 Merged user data:', mergedUser);

                    set({
                        tokens: auth.tokens,
                        user: mergedUser,
                    });

                    enqueueSnackbar('Profil mis à jour avec succès', { variant: 'success' });
                    setIsEditing(false);
                }
            } else {
                console.error('❌ No response received from updateProfile');
                throw new Error('No response from server');
            }
        } catch (error: any) {
            console.error('❌ Error updating profile:', error);

            if (error.response?.status === 401) {
                enqueueSnackbar('Session expirée', { variant: 'error' });
                set({ tokens: undefined, user: undefined });
                navigate('/login');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Échec de la mise à jour du profil';
                enqueueSnackbar(errorMessage, { variant: 'error' });
            }
      } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            enqueueSnackbar('Les mots de passe ne correspondent pas', { variant: 'error' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            enqueueSnackbar('Le mot de passe est trop court', { variant: 'error' });
            return;
        }

        setIsPasswordChanging(true);

        try {
            console.log('🔐 Changing password...');

            const response = await UserAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            enqueueSnackbar(response.message || 'Mot de passe modifié avec succès', { variant: 'success' });

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            console.error('❌ Error changing password:', error);

            if (error.response?.status === 401) {
                enqueueSnackbar('Session expirée', { variant: 'error' });
                set({ tokens: undefined, user: undefined });
                navigate('/login');
            } else {
                const errorMessage = error.message || 'Échec de la mise à jour du mot de passe';
                enqueueSnackbar(errorMessage, { variant: 'error' });
            }
        } finally {
            setIsPasswordChanging(false);
        }
    };

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            console.log('❌ No file selected');
            return;
        }

        console.log('📄 Selected file:', {
            name: file.name,
            size: file.size,
            type: file.type,
        });

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            enqueueSnackbar('Fichier trop volumineux. Veuillez sélectionner une image plus petite que 5MB', { variant: 'error' });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            enqueueSnackbar('Veuillez sélectionner un fichier image valide (JPEG, PNG, GIF, WebP)', { variant: 'error' });
            return;
        }

        setIsUploadingAvatar(true);

        try {
            console.log('🖼️ Uploading avatar...');

            const formDataToUpload = new FormData();
            formDataToUpload.append('avatar', file);
            const response = await UserAPI.uploadAvatar(formDataToUpload);

            console.log('✅ Avatar upload response:', response);

            if (response && (response.success || response.user || response.data)) {
                // Clear the input immediately
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                // Get the updated user data
                const updatedUser = response.user || response.data || response;
                console.log('✅ Avatar uploaded successfully. Updated user:', updatedUser);
                console.log('✅ Updated user avatar:', updatedUser.avatar);
                console.log('✅ Response attachment:', response.attachment);

                // Store current user BEFORE any refresh to preserve all data
                const currentUserBeforeRefresh = auth.user;
                console.log('🔍 [AVATAR] Current user BEFORE refresh:', currentUserBeforeRefresh);
                console.log('🔍 [AVATAR] Current user keys:', currentUserBeforeRefresh ? Object.keys(currentUserBeforeRefresh) : 'null');
                console.log('🔍 [AVATAR] Current tokens:', auth.tokens ? 'exists' : 'missing');

                // Fetch fresh user data FIRST to get the complete user object with proper avatar URLs
                let freshUserData = null;
                try {
                    console.log('🔄 [AVATAR] Fetching fresh user data after avatar upload...');
                    freshUserData = await refreshUserData();
                    console.log('✅ [AVATAR] Fresh user data fetched:', freshUserData);
                    console.log('✅ [AVATAR] Fresh user data keys:', freshUserData ? Object.keys(freshUserData) : 'null');
                    
                    // Check if auth.user became undefined after refresh
                    const authAfterRefresh = authStore.getState().auth;
                    console.log('🔍 [AVATAR] Auth state AFTER refreshUserData:', authAfterRefresh);
                    console.log('🔍 [AVATAR] Auth.user after refresh:', authAfterRefresh.user);
                    console.log('🔍 [AVATAR] Auth.user keys after refresh:', authAfterRefresh.user ? Object.keys(authAfterRefresh.user) : 'null');
                } catch (refreshError) {
                    console.error('❌ [AVATAR] Error refreshing user data:', refreshError);
                    console.warn('⚠️ [AVATAR] Using response data instead');
                }

                // Use fresh user data if available, otherwise use response data
                const userToMerge = freshUserData || updatedUser;
                console.log('🔍 [AVATAR] userToMerge to use:', userToMerge);
                console.log('🔍 [AVATAR] userToMerge keys:', userToMerge ? Object.keys(userToMerge) : 'null');

                // Get current user from store (might have changed after refreshUserData)
                const currentUserFromStore = authStore.getState().auth.user;
                console.log('🔍 [AVATAR] Current user from store after refresh:', currentUserFromStore);
                console.log('🔍 [AVATAR] Current user from store keys:', currentUserFromStore ? Object.keys(currentUserFromStore) : 'null');
                
                // Prefer currentUserFromStore (from store after refresh) but fallback to currentUserBeforeRefresh
                const currentUser = currentUserFromStore || currentUserBeforeRefresh || auth.user;
                console.log('🔍 [AVATAR] Final currentUser to merge with:', currentUser);
                console.log('🔍 [AVATAR] Final currentUser keys:', currentUser ? Object.keys(currentUser) : 'null');

                // Update auth state with new user data including avatar
                if (userToMerge) {
                    
                    // Ensure avatar has proper URL format
                    let avatarObj = userToMerge.avatar || updatedUser?.avatar;
                    
                    // If response has attachment info, use it to construct proper avatar URL (ALWAYS prefer response.attachment)
                    if (response.attachment) {
                        const attachment = response.attachment;
                        const normalizedUrl = attachment.url?.startsWith('http') 
                            ? attachment.url 
                            : `${API_BASE_URL.replace(/\/$/, '')}${attachment.url?.startsWith('/') ? attachment.url : '/static/' + attachment.url}`;
                        
                        // Use normalizeUrl if available, otherwise use the direct construction
                        const fullUrlForAttachment = attachment.fullUrl 
                            ? (normalizeUrl ? normalizeUrl(attachment.fullUrl) : `${API_BASE_URL.replace(/\/$/, '')}${attachment.fullUrl.startsWith('/') ? attachment.fullUrl : '/' + attachment.fullUrl}`)
                            : normalizedUrl;
                        
                        avatarObj = {
                            _id: attachment._id,
                            url: attachment.url,
                            filename: attachment.filename,
                            fullUrl: fullUrlForAttachment
                        };
                        
                        console.log('✅ Constructed avatar object from response.attachment:', avatarObj);
                    }
                    
                    // Construct photoURL from avatar if not present
                    let photoURL = (userToMerge as any).photoURL || (updatedUser as any).photoURL;
                    if (!photoURL && avatarObj) {
                        const avatar = avatarObj as any;
                        if (avatar.fullUrl) {
                            photoURL = avatar.fullUrl;
                        } else if (avatar.url) {
                            // Normalize the URL
                            if (avatar.url.startsWith('http')) {
                                photoURL = avatar.url;
                            } else if (avatar.url.startsWith('/static/')) {
                                photoURL = `${API_BASE_URL.replace(/\/$/, '')}${avatar.url}`;
                            } else if (avatar.url.startsWith('/')) {
                                photoURL = `${API_BASE_URL.replace(/\/$/, '')}/static${avatar.url}`;
                            } else {
                                photoURL = `${API_BASE_URL.replace(/\/$/, '')}/static/${avatar.url}`;
                            }
                        } else if (avatar.filename) {
                            photoURL = `${API_BASE_URL.replace(/\/$/, '')}/static/${avatar.filename}`;
                        }
                    }

                    // IMPORTANT: Preserve ALL fields from currentUser, only update with non-undefined values from userToMerge
                    // This prevents losing data when userToMerge has undefined fields
                    const mergedUser: any = {
                        ...currentUser, // Start with ALL existing user data
                    };
                    
                    // Only update fields from userToMerge if they are defined (not undefined/null)
                    if (userToMerge) {
                        Object.keys(userToMerge).forEach(key => {
                            const value = (userToMerge as any)[key];
                            // Only update if value is not undefined and not null
                            if (value !== undefined && value !== null) {
                                mergedUser[key] = value;
                            }
                        });
                    }
                    
                    // Ensure critical fields are set
                    mergedUser.type = userToMerge?.type || userToMerge?.accountType || currentUser?.type || 'PROFESSIONAL';
                    mergedUser._id = userToMerge?._id || currentUser?._id || mergedUser._id;
                    mergedUser.firstName = userToMerge?.firstName || currentUser?.firstName || mergedUser.firstName;
                    mergedUser.lastName = userToMerge?.lastName || currentUser?.lastName || mergedUser.lastName;
                    mergedUser.email = userToMerge?.email || currentUser?.email || mergedUser.email;
                    // Preserve verification and certification status
                    mergedUser.isVerified = (userToMerge as any)?.isVerified ?? (currentUser as any)?.isVerified ?? mergedUser.isVerified;
                    mergedUser.isCertified = (userToMerge as any)?.isCertified ?? (currentUser as any)?.isCertified ?? mergedUser.isCertified ?? false;
                    
                    console.log('🔍 [AVATAR] Merged user object:', mergedUser);
                    console.log('🔍 [AVATAR] Merged user keys:', Object.keys(mergedUser));
                    console.log('🔍 [AVATAR] Merged user has _id?', !!mergedUser._id);
                    console.log('🔍 [AVATAR] Merged user has firstName?', !!mergedUser.firstName);
                    
                    // Helper to normalize URL inline (in case normalizeUrl is not yet defined)
                    const normalizeUrlInline = (url: string): string => {
                        if (!url || url.trim() === '') return '';
                        const cleanUrl = url.trim();
                        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
                            let normalized = cleanUrl
                                .replace(/http:\/\/localhost:3000/g, API_BASE_URL.replace(/\/$/, ''))
                                .replace(/http:\/\/localhost\//g, API_BASE_URL.replace(/\/$/, '') + '/')
                                .replace(/http:\/\/localhost$/g, API_BASE_URL.replace(/\/$/, ''));
                            if (normalized.startsWith('http://localhost')) {
                                try {
                                    const urlObj = new URL(cleanUrl);
                                    normalized = `${API_BASE_URL.replace(/\/$/, '')}${urlObj.pathname}`;
                                } catch (e) {
                                    console.warn('Failed to parse URL:', cleanUrl);
                                }
                            }
                            return normalized;
                        }
                        if (cleanUrl.startsWith('/static/')) {
                            return `${API_BASE_URL.replace(/\/$/, '')}${cleanUrl}`;
                        }
                        if (cleanUrl.startsWith('/')) {
                            return `${API_BASE_URL.replace(/\/$/, '')}/static${cleanUrl}`;
                        }
                        return `${API_BASE_URL.replace(/\/$/, '')}/static/${cleanUrl}`;
                    };
                    
                    // If we have a new avatar object, use it and construct photoURL from it
                    if (avatarObj) {
                        mergedUser.avatar = avatarObj;
                        // Always set photoURL from the new avatar (without cache-bust, will be added in getAvatarSrc)
                        const urlToUse = avatarObj.fullUrl || avatarObj.url || avatarObj.filename;
                        if (urlToUse) {
                            const normalized = normalizeUrl ? normalizeUrl(urlToUse) : normalizeUrlInline(urlToUse);
                            // Don't add cache-bust here - getAvatarSrc() will handle it
                            // But remove any existing cache-bust params to keep it clean
                            mergedUser.photoURL = normalized.replace(/[?&]v=\d+/g, '');
                        }
                        // Remove any old mock avatar paths
                        if ((mergedUser as any).photoURL?.includes('mock-images')) {
                            (mergedUser as any).photoURL = undefined;
                        }
                    } else if (photoURL) {
                        // If we have a photoURL but no avatarObj, use the photoURL (without cache-bust, will be added in getAvatarSrc)
                        const normalized = normalizeUrl ? normalizeUrl(photoURL) : normalizeUrlInline(photoURL);
                        // Don't add cache-bust here - getAvatarSrc() will handle it
                        // But remove any existing cache-bust params to keep it clean
                        mergedUser.photoURL = normalized.replace(/[?&]v=\d+/g, '');
                        // Remove any old mock avatar paths
                        if (mergedUser.photoURL?.includes('mock-images')) {
                            mergedUser.photoURL = undefined;
                        }
                    } else {
                        // If no new avatar, keep existing but remove mock paths and cache-bust params
                        if ((mergedUser as any).photoURL) {
                            (mergedUser as any).photoURL = (mergedUser as any).photoURL.replace(/[?&]v=\d+/g, '');
                        }
                        if ((mergedUser as any).photoURL?.includes('mock-images')) {
                            delete (mergedUser as any).photoURL;
                        }
                    }

                    console.log('👤 [AVATAR] Merged user with avatar:', mergedUser);
                    console.log('👤 [AVATAR] Merged user avatar:', mergedUser.avatar);
                    console.log('👤 [AVATAR] Merged user photoURL:', mergedUser.photoURL);
                    console.log('🔍 [AVATAR] About to call authStore.set with:');
                    console.log('  - user keys:', Object.keys(mergedUser));
                    console.log('  - user._id:', mergedUser._id);
                    console.log('  - tokens exists?', !!auth.tokens);
                    console.log('  - tokens.accessToken exists?', !!auth.tokens?.accessToken);

                    // Ensure we have tokens before setting
                    const tokensToUse = auth.tokens || authStore.getState().auth.tokens;
                    if (!tokensToUse) {
                        console.error('❌ [AVATAR] CRITICAL: No tokens available! Cannot update auth store.');
                        enqueueSnackbar('Erreur: session expirée. Veuillez vous reconnecter.', { variant: 'error' });
                        return;
                    }

                    if (!mergedUser._id) {
                        console.error('❌ [AVATAR] CRITICAL: Merged user has no _id! User object:', mergedUser);
                        enqueueSnackbar('Erreur: données utilisateur invalides.', { variant: 'error' });
                        return;
                    }

                    console.log('✅ [AVATAR] Calling authStore.set with complete data...');
                    set({
                        user: mergedUser,
                        tokens: tokensToUse,
                    });
                    
                    // Verify the set worked
                    setTimeout(() => {
                        const verifyAuth = authStore.getState().auth;
                        console.log('🔍 [AVATAR] Verification after set:');
                        console.log('  - auth.user exists?', !!verifyAuth.user);
                        console.log('  - auth.user keys:', verifyAuth.user ? Object.keys(verifyAuth.user) : 'null');
                        console.log('  - auth.user._id:', verifyAuth.user?._id);
                        console.log('  - auth.tokens exists?', !!verifyAuth.tokens);
                        if (!verifyAuth.user) {
                            console.error('❌ [AVATAR] CRITICAL: User became undefined after set!');
                        }
                    }, 100);
                }

                // Force a cache-bust for the avatar and trigger re-render
                setAvatarKey(Date.now());

                // Show success message
                enqueueSnackbar(response.message || 'Avatar mis à jour avec succès', { variant: 'success' });

                // Force a small delay to ensure state is updated, then refresh again to be safe
                setTimeout(async () => {
                    try {
                        console.log('🔄 Final refresh of user data...');
                        await refreshUserData();
                        setAvatarKey(Date.now()); // Update again to force image reload
                    } catch (err) {
                        console.warn('⚠️ Error in final refresh:', err);
                    }
                }, 1000);
            } else {
                console.error('❌ Upload response indicates failure:', response);
                enqueueSnackbar(response?.message || 'Échec du téléchargement de l\'avatar', { variant: 'error' });
            }
        } catch (error: any) {
            console.error('❌ Error uploading avatar:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Échec du téléchargement de l\'avatar';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setIsUploadingAvatar(false);
            // Ensure input is cleared
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Document management functions
    const fetchIdentity = async () => {
        try {
            setIsLoadingDocuments(true);
            const response = await IdentityAPI.getMy();
            if (response && (response.data || response)) {
                setIdentity(response.data || response);
            } else {
                setIdentity(null);
            }
        } catch (error: any) {
            console.error('Error fetching identity:', error);
            // Don't show error snackbar for timeout or missing identity - it's expected
            if (error.response?.status !== 404 && !error.message?.includes('timeout')) {
                enqueueSnackbar('Erreur lors du chargement des documents', { variant: 'error' });
            }
            setIdentity(null);
        } finally {
            setIsLoadingDocuments(false);
        }
    };

    const handleFileSelect = (fieldKey: string, file: File) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            enqueueSnackbar('Format de fichier non supporté. Utilisez JPG, PNG ou PDF.', { variant: 'error' });
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            enqueueSnackbar('Fichier trop volumineux. Taille maximale: 5MB', { variant: 'error' });
            return;
        }

        setUploadingFile(file);
        uploadDocument(fieldKey, file);
    };

    const uploadDocument = async (fieldKey: string, file: File) => {
        try {
            setIsUploadingDocument(fieldKey);

            let response;
            
            // If identity doesn't exist, create it with this document
            if (!identity || !identity._id) {
                const formData = new FormData();
                formData.append(fieldKey, file);
                
                // Create identity with this document (allow incremental uploads)
                response = await IdentityAPI.create(formData);
                
                if (response && response._id) {
                    enqueueSnackbar('Document sauvegardé avec succès. L\'identité a été créée. Cliquez sur "Soumettre" pour envoyer pour vérification.', { variant: 'success' });
                    // Refresh identity data to get the newly created identity
                    await fetchIdentity();
                } else {
                    throw new Error('Failed to create identity with document');
                }
            } else {
                // Update existing identity
                response = await IdentityAPI.updateDocument(identity._id, fieldKey, file);

                if (response && (response.success || response.data)) {
                    enqueueSnackbar('Document sauvegardé avec succès. Cliquez sur "Soumettre" pour envoyer pour vérification.', { variant: 'success' });
                    // Update local state
                    setIdentity((prev: any) =>
                        prev
                            ? {
                                  ...prev,
                                  [fieldKey]: response.data?.[fieldKey] || response[fieldKey] || prev[fieldKey],
                              }
                            : null
                    );
                    // Refresh identity data
                    await fetchIdentity();
                } else {
                    throw new Error(response?.message || 'Upload failed');
                }
            }
        } catch (error: any) {
            console.error('Error uploading document:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du document';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setIsUploadingDocument(null);
            setUploadingFile(null);
        }
    };

    const getDocumentUrl = (document: any): string => {
        if (!document) return '';
        if (document.fullUrl) return document.fullUrl;
        if (document.url) {
            if (document.url.startsWith('http')) {
                return document.url;
            }
            const cleanUrl = document.url.startsWith('/') ? document.url.substring(1) : document.url;
            return `${API_BASE_URL}${cleanUrl}`;
        }
        return '';
    };

    const getDocumentName = (document: any): string => {
        if (!document) return '';
        return document.filename || document.originalname || 'Document';
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Load identity when documents tab is active
    useEffect(() => {
        if (activeTab === 'documents' && !identity) {
            fetchIdentity();
        }
    }, [activeTab]);

    // Helper to normalize URL - always return full URL (for reuse in upload handler and getAvatarSrc)
    const normalizeUrl = React.useCallback((url: string): string => {
        if (!url || url.trim() === '') return '';
        
        // Clean up the URL first - remove trailing slashes and whitespace
        let cleanUrl = url.trim();
        
        // Fix malformed query strings that start with & instead of ?
        // This handles cases like: /path&param=value -> /path?param=value
        if (cleanUrl.includes('&') && !cleanUrl.includes('?')) {
            // Replace first & with ? if there's no ? in the URL
            cleanUrl = cleanUrl.replace('&', '?');
        }
        
        // If already a full HTTP/HTTPS URL, normalize it
        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
            // Replace localhost:3000 or localhost (without port) with API_BASE_URL
            let normalized = cleanUrl
                .replace(/http:\/\/localhost:3000/g, API_BASE_URL.replace(/\/$/, ''))
                .replace(/http:\/\/localhost\//g, API_BASE_URL.replace(/\/$/, '') + '/')
                .replace(/http:\/\/localhost$/g, API_BASE_URL.replace(/\/$/, ''));
            
            // If it still doesn't have the correct base, try to fix it
            if (normalized.startsWith('http://localhost') && !normalized.includes(API_BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''))) {
                try {
                    // Extract the path part (including query string if any)
                    const urlObj = new URL(cleanUrl);
                    const pathWithQuery = urlObj.pathname + (urlObj.search || '');
                    normalized = `${API_BASE_URL.replace(/\/$/, '')}${pathWithQuery}`;
                } catch (e) {
                    // If URL parsing fails, just use the cleaned URL
                    console.warn('Failed to parse URL:', cleanUrl);
                }
            }
            
            return normalized;
        }
        
        // If starts with /static/, prepend API_BASE_URL
        if (cleanUrl.startsWith('/static/')) {
            return `${API_BASE_URL.replace(/\/$/, '')}${cleanUrl}`;
        }
        
        // If starts with / but not /static/, try /static/
        if (cleanUrl.startsWith('/')) {
            return `${API_BASE_URL.replace(/\/$/, '')}/static${cleanUrl}`;
        }
        
        // If no leading slash, assume it's a filename and prepend /static/
        return `${API_BASE_URL.replace(/\/$/, '')}/static/${cleanUrl}`;
    }, []);

    const appendCacheBuster = (url: string) => {
        if (!url) return url;
        
        console.log('🔧 [CacheBuster] Input URL:', url);
        
        // Remove any existing v param (both ?v= and &v=)
        // Also handle edge cases like &v=123& or ?v=123&other=value
        let cleaned = url.replace(/[?&]v=\d+/g, '');
        
        // Clean up any double separators that might result (e.g., ?& -> ?, && -> &)
        cleaned = cleaned.replace(/\?&/g, '?').replace(/&&+/g, '&');
        
        // Remove trailing & or ? if they're at the end
        cleaned = cleaned.replace(/[?&]+$/, '');
        
        // Check if cleaned URL has a query string (after cleaning)
        const hasQuery = cleaned.includes('?');
        
        // Use ? if no query string exists, otherwise use &
        const separator = hasQuery ? '&' : '?';
        const result = cleaned + separator + `v=${avatarKey}`;
        
        console.log('🔧 [CacheBuster] Cleaned URL:', cleaned);
        console.log('🔧 [CacheBuster] Has query?', hasQuery);
        console.log('🔧 [CacheBuster] Using separator:', separator);
        console.log('🔧 [CacheBuster] Final URL:', result);
        
        return result;
    };

    const getAvatarSrc = () => {
        if (!auth.user) return '/assets/images/avatar.jpg';

        console.log('🖼️ Constructing avatar URL from:', auth.user);
        console.log('🖼️ Avatar object:', auth.user.avatar);
        console.log('🖼️ photoURL:', (auth.user as any).photoURL);

        // Priority 1: photoURL (full URL from backend)
        if ((auth.user as any).photoURL && (auth.user as any).photoURL.trim() !== '') {
            const cleanUrl = normalizeUrl((auth.user as any).photoURL);
            if (cleanUrl && !cleanUrl.includes('mock-images')) {
                console.log('📸 Using photoURL:', cleanUrl);
                return appendCacheBuster(cleanUrl);
            }
        }

        // Priority 2: avatar object with fullUrl
        if (auth.user.avatar) {
            const avatar = auth.user.avatar as any;
            
            if (avatar.fullUrl && avatar.fullUrl.trim() !== '') {
                const cleanUrl = normalizeUrl(avatar.fullUrl);
                if (cleanUrl && !cleanUrl.includes('mock-images')) {
                    console.log('📸 Using avatar.fullUrl:', cleanUrl);
                    return appendCacheBuster(cleanUrl);
                }
            }
            
            // Priority 3: avatar.url
            if (avatar.url && avatar.url.trim() !== '') {
                const cleanUrl = normalizeUrl(avatar.url);
                if (cleanUrl && !cleanUrl.includes('mock-images')) {
                    console.log('📸 Using avatar.url:', cleanUrl);
                    return appendCacheBuster(cleanUrl);
                }
            }
            
            // Priority 4: avatar.filename
            if (avatar.filename && avatar.filename.trim() !== '') {
                const cleanUrl = normalizeUrl(avatar.filename);
                if (cleanUrl && !cleanUrl.includes('mock-images')) {
                    console.log('📸 Using avatar.filename:', cleanUrl);
                    return appendCacheBuster(cleanUrl);
                }
            }
        }

        // Priority 5: fallback
        console.log('📸 Using fallback avatar');
        return '/assets/images/avatar.jpg';
    };

    const avatarSrc = getAvatarSrc();
    // Keep last good avatar to prevent flicker/fallback overwrite
    const [stableAvatarSrc, setStableAvatarSrc] = useState<string>('');

    // Log avatar source for debugging and keep a stable one when valid
    useEffect(() => {
        console.log('🖼️ Avatar source updated:', avatarSrc);
        console.log('🖼️ Current user avatar object:', auth.user?.avatar);
        console.log('🖼️ Current user photoURL:', (auth.user as any)?.photoURL);
        if (avatarSrc && !avatarSrc.includes('/assets/images/avatar.jpg')) {
            setStableAvatarSrc(avatarSrc);
        }
    }, [avatarSrc, auth.user?.avatar, (auth.user as any)?.photoURL]);

    // Show login prompt if not logged in
    if (isReady && !isLogged) {
  return (
            <div className="profile-login-required">
                <div className="login-prompt">
                    <h2>Authentification requise</h2>
                    <p>Veuillez vous connecter pour accéder à votre profil.</p>
                    <button onClick={() => navigate('/login')}>Aller à la connexion</button>
                </div>
            </div>
        );
    }

    // Helper function to render document cards
    const [isSubmittingIdentity, setIsSubmittingIdentity] = useState(false);

    const handleSubmitIdentity = async () => {
        if (!identity || !identity._id) {
            enqueueSnackbar('Veuillez d\'abord télécharger au moins un document', { variant: 'warning' });
            return;
        }

        try {
            setIsSubmittingIdentity(true);
            const response = await IdentityAPI.submitIdentity(identity._id);
            
            if (response && response.success) {
                enqueueSnackbar(
                    response.message || 'Documents soumis avec succès. En attente de vérification par l\'administrateur.',
                    { variant: 'success' }
                );
                await fetchIdentity(); // Refresh to get updated status
            } else {
                throw new Error(response?.message || 'Failed to submit identity');
            }
        } catch (error: any) {
            console.error('Error submitting identity:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la soumission des documents';
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setIsSubmittingIdentity(false);
        }
    };

    const renderDocumentCards = (documents: any[], sectionTitle: string, isRequired: boolean) => {
        return (
            <div className="modern-document-section">
                <div className="modern-document-section-header">
                    <h3 className="modern-document-section-title">
                        <i className={`bi-${isRequired ? 'exclamation-triangle-fill' : 'plus-circle-fill'}`}></i>
                        {sectionTitle}
                    </h3>
                    <div className={`modern-document-section-badge ${isRequired ? 'required' : 'optional'}`}>
                        {isRequired ? 'Obligatoire' : 'Optionnel'}
                    </div>
                </div>

                {isRequired && (
                    <div className="modern-document-optional-note">
                        <div className="modern-document-note-card">
                            <i className="bi-info-circle-fill"></i>
                            <div className="modern-document-note-content">
                                <h4>Vérification</h4>
                                <p>
                                    Fournir (RC/ Autres + NIF) ou (Carte Fellah uniquement).
                                </p>
                                <p>
                                    Cliquez sur "Soumettre" pour envoyer à l'administrateur.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!isRequired && (
                    <div className="modern-document-optional-note">
                        <div className="modern-document-note-card">
                            <i className="bi-info-circle-fill"></i>
                            <div className="modern-document-note-content">
                                <h4>Certification</h4>
                                <p>
                                    Ajoutez ces documents pour la certification professionnelle.
                                </p>
                                <p>
                                    Cliquez sur "Soumettre" pour envoyer à l'administrateur.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="modern-document-grid">
                    {documents.map((field, index) => {
                        const document = identity?.[field.key];
                        const isUploadingThisField = isUploadingDocument === field.key;
                        const hasDocument = document && ((document as any).url || (document as any).fullUrl);

                        return (
                            <motion.div
                                key={field.key}
                                className={`modern-document-card ${hasDocument ? 'has-document' : 'no-document'} ${isUploadingThisField ? 'uploading' : ''} ${isRequired ? 'required-card' : 'optional-card'}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="modern-document-header">
                                    <div className="modern-document-icon">
                                        <i className={hasDocument ? 'bi-file-earmark-check-fill' : 'bi-file-earmark-plus'}></i>
                                    </div>
                                    <div className="modern-document-info">
                                        <h3 className="modern-document-title">
                                            {field.label}
                                            {field.required && <span className="required-badge">*</span>}
                                        </h3>
                                        <p className="modern-document-description">{field.description}</p>
                                    </div>
                                </div>

                                {hasDocument && (
                                    <div className="modern-document-preview">
                                        <div className="modern-document-file">
                                            {document.mimetype?.startsWith('image/') ? (
                                                <div className="modern-document-image-preview">
                                                    <img
                                                        src={getDocumentUrl(document)}
                                                        alt={getDocumentName(document)}
                                                        className="modern-document-thumbnail"
                                                        onClick={() => window.open(getDocumentUrl(document), '_blank')}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            if (e.currentTarget.nextElementSibling) {
                                                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                                            }
                                                        }}
                                                    />
                                                    <div className="modern-document-icon-fallback" style={{ display: 'none' }}>
                                                        <i className="bi-file-earmark-image"></i>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="modern-document-icon">
                                                    <i className={`bi-${document.mimetype?.includes('pdf') ? 'file-earmark-pdf' : 'file-earmark-text'}`}></i>
                                                </div>
                                            )}
                                            <div className="modern-document-info-text">
                                                <span className="modern-document-name">{getDocumentName(document)}</span>
                                                <span className="modern-document-type">{document.mimetype || 'Document'}</span>
                                            </div>
                                        </div>
                                        <div className="modern-document-actions">
                                            <a
                                                href={getDocumentUrl(document)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="modern-btn modern-btn-outline modern-btn-sm"
                                            >
                                                <i className="bi-eye"></i>
                                                Voir
                                            </a>
                                        </div>
                                    </div>
                                )}

                                <div className="modern-document-upload">
                                    <input
                                        ref={(el) => {
                                            documentFileInputRefs.current[field.key] = el;
                                        }}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                handleFileSelect(field.key, file);
                                            }
                                        }}
                                        style={{ display: 'none' }}
                                    />

                                    <motion.button
                                        className={`modern-btn ${hasDocument ? 'modern-btn-outline' : 'modern-btn-primary'} modern-btn-full`}
                                        onClick={() => documentFileInputRefs.current[field.key]?.click()}
                                        disabled={isUploadingThisField}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isUploadingThisField ? (
                                            <>
                                                <div className="modern-spinner-sm"></div>
                                                Upload en cours...
                                            </>
                                        ) : hasDocument ? (
                                            <>
                                                <i className="bi-arrow-clockwise"></i>
                                                Remplacer
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi-upload"></i>
                                                Ajouter
                                            </>
                                        )}
                                    </motion.button>
                                </div>

                                {isUploadingThisField && uploadingFile && (
                                    <div className="modern-upload-progress">
                                        <div className="modern-upload-info">
                                            <span className="modern-upload-filename">{uploadingFile.name}</span>
                                            <span className="modern-upload-size">{formatFileSize(uploadingFile.size)}</span>
                                        </div>
                                        <div className="modern-progress-bar">
                                            <div className="modern-progress-fill"></div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Submit button for required documents section - only show when documents are ready */}
                {isRequired && identity && identity._id && (() => {
                    const hasRc = identity.registreCommerceCarteAuto && ((identity.registreCommerceCarteAuto as any).url || (identity.registreCommerceCarteAuto as any).fullUrl);
                    const hasNif = identity.nifRequired && ((identity.nifRequired as any).url || (identity.nifRequired as any).fullUrl);
                    const hasCarteFellah = identity.carteFellah && ((identity.carteFellah as any).url || (identity.carteFellah as any).fullUrl);
                    const canSubmit = (hasRc && hasNif) || hasCarteFellah;
                    
                    // Don't show button if documents aren't ready for submission
                    if (!canSubmit) return null;
                    
                    return (
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <motion.button
                                className="modern-btn modern-btn-primary"
                                onClick={handleSubmitIdentity}
                                disabled={isSubmittingIdentity || identity?.status === 'WAITING' || identity?.status === 'DONE'}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    padding: '0.8rem 2rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    minWidth: '200px',
                                    opacity: (identity?.status === 'WAITING' || identity?.status === 'DONE') ? 0.6 : 1,
                                    cursor: (identity?.status === 'WAITING' || identity?.status === 'DONE') ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isSubmittingIdentity ? (
                                    <>
                                        <div className="modern-spinner-sm" style={{ marginRight: '0.5rem' }}></div>
                                        Soumission...
                                    </>
                                ) : identity?.status === 'WAITING' ? (
                                    <>
                                        <i className="bi-clock-history" style={{ marginRight: '0.5rem' }}></i>
                                        En attente de vérification
                                    </>
                                ) : identity?.status === 'DONE' ? (
                                    <>
                                        <i className="bi-check-circle-fill" style={{ marginRight: '0.5rem' }}></i>
                                        Vérifié
                                    </>
                                ) : (
                                    <>
                                        <i className="bi-send-fill" style={{ marginRight: '0.5rem' }}></i>
                                        Soumettre pour vérification
                                    </>
                                )}
                            </motion.button>
                        </div>
                    );
                })()}

                {/* Submit button for optional documents section - show when at least one optional document is uploaded */}
                {!isRequired && identity && identity._id && (() => {
                    // Check if any optional document is uploaded
                    const optionalDocKeys = ['commercialRegister', 'carteAutoEntrepreneur', 'nif', 'nis', 'numeroArticle', 'c20', 'misesAJourCnas', 'last3YearsBalanceSheet', 'certificates', 'identityCard'];
                    const hasAnyOptionalDoc = optionalDocKeys.some(key => {
                        const doc = identity[key];
                        return doc && ((doc as any).url || (doc as any).fullUrl);
                    });
                    
                    // Don't show button if no optional documents are uploaded
                    if (!hasAnyOptionalDoc) return null;
                    
                    const certificationStatus = (identity as any).certificationStatus || 'DRAFT';
                    const isCertificationWaiting = certificationStatus === 'WAITING';
                    const isCertificationDone = certificationStatus === 'DONE';
                    
                    return (
                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <motion.button
                                className="modern-btn modern-btn-primary"
                                onClick={async () => {
                                    if (!identity || !identity._id) {
                                        enqueueSnackbar('Veuillez d\'abord télécharger au moins un document', { variant: 'warning' });
                                        return;
                                    }

                                    try {
                                        setIsSubmittingIdentity(true);
                                        const response = await IdentityAPI.submitCertification(identity._id);
                                        
                                        if (response && response.success) {
                                            enqueueSnackbar(
                                                response.message || 'Documents de certification soumis avec succès. En attente de vérification par l\'administrateur.',
                                                { variant: 'success' }
                                            );
                                            await fetchIdentity(); // Refresh to get updated status
                                        } else {
                                            throw new Error(response?.message || 'Failed to submit certification');
                                        }
                                    } catch (error: any) {
                                        console.error('Error submitting certification:', error);
                                        const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la soumission des documents de certification';
                                        enqueueSnackbar(errorMessage, { variant: 'error' });
                                    } finally {
                                        setIsSubmittingIdentity(false);
                                    }
                                }}
                                disabled={isSubmittingIdentity || isCertificationWaiting || isCertificationDone}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    padding: '0.8rem 2rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    minWidth: '200px',
                                    opacity: (isCertificationWaiting || isCertificationDone) ? 0.6 : 1,
                                    cursor: (isCertificationWaiting || isCertificationDone) ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isSubmittingIdentity ? (
                                    <>
                                        <div className="modern-spinner-sm" style={{ marginRight: '0.5rem' }}></div>
                                        Soumission...
                                    </>
                                ) : isCertificationWaiting ? (
                                    <>
                                        <i className="bi-clock-history" style={{ marginRight: '0.5rem' }}></i>
                                        En attente de certification
                                    </>
                                ) : isCertificationDone ? (
                                    <>
                                        <i className="bi-award-fill" style={{ marginRight: '0.5rem' }}></i>
                                        Certifié
                                    </>
                                ) : (
                                    <>
                                        <i className="bi-send-fill" style={{ marginRight: '0.5rem' }}></i>
                                        Soumettre pour certification
                                    </>
                                )}
                            </motion.button>
                        </div>
                    );
                })()}
            </div>
        );
    };

    return (
        <main className="modern-profile-page">
            {/* Animated Background */}
            <div className="profile-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            {/* Page Header with Title */}
            <motion.div
                className="profile-page-header"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="profile-header-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="profile-page-title"
                    >
                        Mon Profil
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="profile-page-subtitle"
                    >
                        Gérez votre profil et vos paramètres
                    </motion.p>
                </div>
            </motion.div>

            <div className="modern-profile-container">
                {/* Hero Section - Full Width */}
                <motion.div
                    className="modern-profile-hero"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        {/* Profile Avatar Card - Centered */}
                        <div
                            className="hero-avatar-card"
                            style={{ boxShadow: 'none' }}
                        >
                            <div className="avatar-container">
                                <div className="avatar-wrapper" style={{ position: 'relative' }}>
                                    <div className="avatar-frame" style={{
                                        boxShadow: '0 0 0 2px #e5e7eb',
                                        border: '4px solid #fff',
                                        background: '#fff',
                                        borderRadius: '50%',
                                        padding: 0,
                                        overflow: 'hidden'
                                    }}>
                                        <img
                                            key={`avatar-${avatarKey}-${auth.user?._id || 'default'}`}
                                            src={stableAvatarSrc || avatarSrc}
                                            alt="Profile"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '50%',
                                                display: 'block'
                                            }}
                                            loading="lazy"
                                            
                                            onError={(e) => {
                                                const target = e.currentTarget as HTMLImageElement;
                                                const attemptedUrl = target.src;

                                                console.log('🖼️ Image failed to load:', attemptedUrl);

                                                if (attemptedUrl.includes('/assets/images/avatar.jpg') || attemptedUrl.endsWith('avatar.jpg')) {
                                                    target.onerror = null;
                                                    return;
                                                }

                                                // Try to reconstruct URL using getAvatarSrc logic
                                                const reconstructed = getAvatarSrc();
                                                if (reconstructed && reconstructed !== attemptedUrl && !reconstructed.includes('avatar.jpg')) {
                                                    console.log('🔄 Trying reconstructed URL:', reconstructed);
                                                    target.onerror = null;
                                                    target.src = reconstructed;
                                                    try { setStableAvatarSrc(reconstructed); } catch {}
                                                    return;
                                                }

                                                console.log('🔄 Using fallback avatar');
                                                target.onerror = null;
                                                target.src = '/assets/images/avatar.jpg';
                                                try { setStableAvatarSrc('/assets/images/avatar.jpg'); } catch {}
                                            }}
                                            onLoad={(ev) => {
                                                console.log('✅ Avatar loaded successfully');
                                                try {
                                                    const t = ev.currentTarget as HTMLImageElement;
                                                    if (t && t.src && !t.src.includes('avatar.jpg')) setStableAvatarSrc(t.src);
                                                } catch {}
                                            }}
                                        />
                                    </div>
                                    {/* Golden Rating Badge - Outside the image */}
                                    {auth.user?.rate && auth.user.rate > 0 && (
                                        <div
                                            className="rating-badge-avatar"
                                            style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                background: 'transparent',
                                                borderRadius: '50%',
                                                width: 'auto',
                                                height: 'auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 10,
                                                cursor: 'default',
                                                padding: '4px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: '18px',
                                                    fontWeight: '800',
                                                    color: '#FFD700',
                                                    textShadow: '0 0 10px rgba(255, 215, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
                                                    letterSpacing: '-0.5px',
                                                    lineHeight: '1',
                                                }}
                                            >
                                                +{Math.round(auth.user.rate)}
                                            </span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarChange}
                                    />

                                    <button
                                        className="modern-avatar-btn"
                                        onClick={handleAvatarClick}
                                        disabled={isUploadingAvatar}
                                        title={isUploadingAvatar ? 'Téléchargement...' : 'Changer l\'avatar'}
                                    >
                                        {isUploadingAvatar ? (
                                            <div className="loading-spinner">
                                                <i className="bi bi-arrow-clockwise"></i>
                                            </div>
                                        ) : (
                                            <i className="bi bi-camera-fill"></i>
                                        )}
                                    </button>
                                </div>

                                <div className="avatar-info">
                                    <motion.h3
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 1.1 }}
                                    >
                                        {auth.user?.firstName} {auth.user?.lastName || 'Utilisateur'}
                                    </motion.h3>
                                    <motion.p
                                        className="user-email"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 1.2 }}
                                    >
                                        {auth.user?.email}
                                    </motion.p>

                                    {/* Professional and Verified Badges */}
                                    <motion.div
                                        className="user-badges-container"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 1.3 }}
                                        style={{
                                            display: 'flex',
                                            gap: '6px',
                                            marginTop: '4px',
                                            flexWrap: 'wrap',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {/* Professional Badge */}
                                        {auth.user?.type === 'PROFESSIONAL' && (
                                            <motion.div
                                                className="user-badge professional"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: 1.4 }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                    padding: '3px 6px',
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    borderRadius: '10px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                }}
                                            >
                                                <i className="bi bi-star-fill" style={{ fontSize: '9px' }}></i>
                                                <span>PRO</span>
                                            </motion.div>
                                        )}

                                        {/* Verified Badge */}
                                        {(auth.user as any)?.isVerified && (
                                            <motion.div
                                                className="user-badge verified"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: 1.5 }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                    padding: '3px 6px',
                                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                    color: 'white',
                                                    borderRadius: '10px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 8px rgba(17, 153, 142, 0.3)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    marginRight: '6px',
                                                }}
                                            >
                                                <i className="bi bi-check-circle-fill" style={{ fontSize: '9px' }}></i>
                                                <span>VERIFIED</span>
                                            </motion.div>
                                        )}
                                        {/* Certified Badge */}
                                        {(auth.user as any)?.isCertified && (
                                            <motion.div
                                                className="user-badge certified"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: 1.6 }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                    padding: '3px 6px',
                                                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                                                    color: 'white',
                                                    borderRadius: '10px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    marginLeft: '6px',
                                                }}
                                            >
                                                <i className="bi bi-award-fill" style={{ fontSize: '9px' }}></i>
                                                <span>CERTIFIÉ</span>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="modern-content-grid">
                    {/* Profile Tabs Section */}
                    <motion.div
                        className="modern-tabs-section"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                    >
                        {/* Tab Navigation */}
                        <div className="modern-tab-nav">
                            {[
                                { id: 'personal-info', icon: 'bi-person-circle', label: 'Informations personnelles' },
                                { id: 'security', icon: 'bi-shield-lock-fill', label: 'Sécurité' },
                                { id: 'documents', icon: 'bi-file-earmark-text-fill', label: 'Documents' },
                            ].map((tab, index) => (
                                <motion.button
                                    key={tab.id}
                                    className={`modern-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.3 + index * 0.1, type: 'spring' }}
                                >
                                    <i className={tab.icon}></i>
                                    <span>{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            className="tab-indicator"
                                            layoutId="tab-indicator"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="modern-tab-content">
                            <AnimatePresence mode="wait">
                                {/* Personal Info Tab */}
                                {activeTab === 'personal-info' && (
                                    <motion.div
                                        key="personal-info"
                                        className="modern-tab-content"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.6, type: 'spring' }}
                                    >
                                        <div className="modern-section-card">
                                            <div className="section-header">
                                                <div className="header-content">
                                                    <motion.div
                                                        className="header-icon"
                                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                                        transition={{ type: 'spring', stiffness: 300 }}
                                                    >
                                                        <i className="bi bi-person-circle"></i>
                                                    </motion.div>
                                                    <div className="header-text">
                                                        <h2>Informations personnelles</h2>
                                                        <p>Gérez vos informations personnelles et les détails de votre profil</p>
                                                    </div>
                                                </div>
                                                <motion.button
                                                    className={`modern-edit-button ${isEditing ? 'editing' : ''}`}
                                                    onClick={() => setIsEditing(!isEditing)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    transition={{ type: 'spring', stiffness: 400 }}
                                                >
                                                    <motion.i
                                                        className={`bi ${isEditing ? 'bi-x-circle' : 'bi-pencil-square'}`}
                                                        animate={{ rotate: isEditing ? 180 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                    <span>{isEditing ? 'Annuler' : 'Modifier'}</span>
                                                </motion.button>
                                            </div>

                                            <motion.form
                                                onSubmit={handleSubmit}
                                                className="modern-profile-form"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: 0.5 }}
                                            >
                                                <div className="modern-form-grid">
                                                    <motion.div
                                                        className="modern-form-field"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.5, delay: 0.6 }}
                                                    >
                                                        <label htmlFor="firstName">Prénom</label>
                                                        <input
                                                            type="text"
                                                            id="firstName"
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            required
                                                            placeholder="Entrez votre prénom"
                                                        />
                                                    </motion.div>

                                                    <motion.div
                                                        className="modern-form-field"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.5, delay: 0.7 }}
                                                    >
                                                        <label htmlFor="lastName">Nom</label>
                                                        <input
                                                            type="text"
                                                            id="lastName"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            required
                                                            placeholder="Entrez votre nom"
                                                        />
                                                    </motion.div>

                                                    <motion.div
                                                        className="modern-form-field"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.5, delay: 0.8 }}
                                                    >
                                                        <label htmlFor="email">Email</label>
                                                        <input
                                                            type="email"
                                                            id="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            required
                                                            placeholder="Entrez votre adresse email"
                                                        />
                                                    </motion.div>

                                                    <motion.div
                                                        className="modern-form-field"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.5, delay: 0.9 }}
                                                    >
                                                        <label htmlFor="phone">Téléphone</label>
                                                        <input
                                                            type="tel"
                                                            id="phone"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleInputChange}
                                                            disabled={!isEditing}
                                                            placeholder="Entrez votre numéro de téléphone"
                                                        />
                                                    </motion.div>
                                                </div>

                                                {isEditing && (
                                                    <motion.div
                                                        className="modern-actions"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, delay: 1.0 }}
                                                    >
                                                        <motion.button
                                                            type="button"
                                                            onClick={() => setIsEditing(false)}
                                                            className="modern-btn secondary"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <i className="bi bi-x-circle"></i>
                                                            <span>Annuler</span>
                                                        </motion.button>

                                                        <motion.button
            type="submit"
                                                            disabled={isLoading}
                                                            className="modern-btn primary"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <div className="loading-spinner-lg"></div>
                                                                    <span>Enregistrement...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-check-circle"></i>
                                                                    <span>Enregistrer les modifications</span>
                                                                </>
                                                            )}
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </motion.form>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <motion.div
                                        key="security"
                                        className="modern-tab-content"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.6, type: 'spring' }}
                                    >
                                        <div className="modern-section-card">
                                            <div className="section-header">
                                                <div className="header-content">
                                                    <motion.div
                                                        className="header-icon"
                                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                                        transition={{ type: 'spring', stiffness: 300 }}
                                                    >
                                                        <i className="bi bi-shield-lock-fill"></i>
                                                    </motion.div>
                                                    <div className="header-text">
                                                        <h2>Sécurité</h2>
                                                        <p>Mettez à jour votre mot de passe et vos paramètres de sécurité</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.form
                                                onSubmit={handlePasswordSubmit}
                                                className="modern-profile-form"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.6, delay: 0.3 }}
                                            >
                                                <div className="modern-form-grid">
                                                    {[
                                                        { name: 'currentPassword', label: 'Mot de passe actuel', icon: 'bi-lock' },
                                                        { name: 'newPassword', label: 'Nouveau mot de passe', icon: 'bi-key' },
                                                        { name: 'confirmPassword', label: 'Confirmer le mot de passe', icon: 'bi-check-circle' },
                                                    ].map((field, index) => (
                                                        <motion.div
                                                            key={field.name}
                                                            className="modern-form-field"
                                                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                                        >
                                                            <label htmlFor={field.name}>{field.label}</label>
                                                            <input
                                                                type="password"
                                                                id={field.name}
                                                                name={field.name}
                                                                value={passwordData[field.name as keyof typeof passwordData]}
                                                                onChange={handlePasswordChange}
                                                                placeholder={`Entrez ${field.label.toLowerCase()}`}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                <motion.div
                                                    className="modern-actions"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.8 }}
                                                >
                                                    <motion.button
                                                        type="submit"
                                                        disabled={isPasswordChanging}
                                                        className="modern-btn primary"
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        {isPasswordChanging ? (
                                                            <>
                                                                <div className="loading-spinner-lg"></div>
                                                                <span>Mise à jour...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-shield-check"></i>
                                                                <span>Mettre à jour le mot de passe</span>
                                                            </>
                                                        )}
                                                    </motion.button>
                                                </motion.div>
                                            </motion.form>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Documents Tab */}
                                {activeTab === 'documents' && (
                                    <motion.div
                                        key="documents"
                                        className="modern-tab-content"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.6, type: 'spring' }}
                                    >
                                        <div className="modern-section">
                                            <div className="modern-section-header">
                                                <h2 className="modern-section-title">
                                                    <i className="bi-file-earmark-text-fill"></i>
                                                    Gestion des Documents
                                                </h2>
                                                <p className="modern-section-description">
                                                    Gérez vos documents d'identité. Vous pouvez remplacer les documents existants ou ajouter de nouveaux documents optionnels.
                                                </p>
                                            </div>

                                            {isLoadingDocuments ? (
                                                <div className="modern-loading">
                                                    <div className="modern-spinner"></div>
                                                    <p>Chargement des documents...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="modern-upgrade-buttons">
                                                        <motion.button
                                                            className={`modern-upgrade-btn ${activeUpgradeSection === 'verified' ? 'active' : ''}`}
                                                            onClick={() => setActiveUpgradeSection(activeUpgradeSection === 'verified' ? null : 'verified')}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <i className="bi-shield-check"></i>
                                                            Passer à Vérifié
                                                        </motion.button>
                                                        <motion.button
                                                            className={`modern-upgrade-btn ${activeUpgradeSection === 'certified' ? 'active' : ''}`}
                                                            onClick={() => setActiveUpgradeSection(activeUpgradeSection === 'certified' ? null : 'certified')}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <i className="bi-award"></i>
                                                            Passer à Certifié
                                                        </motion.button>
                                                    </div>

                                                    <AnimatePresence>
                                                        {activeUpgradeSection === 'verified' && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                {renderDocumentCards(requiredDocuments, 'Documents Obligatoires pour Vérification', true)}
                                                            </motion.div>
                                                        )}
                                                        {activeUpgradeSection === 'certified' && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                {renderDocumentCards(optionalDocuments, 'Documents Optionnels pour Certification', false)}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {identity && (
                                                        <div className="modern-document-footer">
                                                            <div className="modern-document-status">
                                                                <div className={`modern-status-badge ${identity.status?.toLowerCase() || 'waiting'}`}>
                                                                    <i
                                                                        className={`bi-${
                                                                            identity.status === 'DONE'
                                                                                ? 'check-circle-fill'
                                                                                : identity.status === 'REJECTED'
                                                                                ? 'x-circle-fill'
                                                                                : 'clock-fill'
                                                                        }`}
                                                                    ></i>
                                                                    Statut:{' '}
                                                                    {identity.status === 'DONE'
                                                                        ? 'Approuvé'
                                                                        : identity.status === 'REJECTED'
                                                                        ? 'Rejeté'
                                                                        : 'En attente'}
                                                                </div>
                                                            </div>
                                                            <p className="modern-document-note">
                                                                <i className="bi-info-circle"></i>
                                                                Les documents marqués d'un astérisque (*) sont obligatoires. Vous pouvez remplacer ou ajouter des documents à tout moment.
                                                            </p>
                                                        </div>
                                                    )}
                                                    {!identity && (
                                                        <div className="modern-document-footer">
                                                            <p className="modern-document-note">
                                                                <i className="bi-info-circle"></i>
                                                                Cliquez sur les boutons ci-dessus pour voir les documents requis pour chaque niveau de vérification.
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
