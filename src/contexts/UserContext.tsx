/** @format */

import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth';
import { ProductAPI } from '../api/product';
import User from '@/types/User';
import { UserAPI } from '@/api/user';

interface IUserContext {
  users: User[];
  updateAllUsers: () => Promise<void>;
}

export const UserContext = createContext<IUserContext>({
  users: [] as User[],
  updateAllUsers: async () => {},
});

const UserProvider = ({ children }: any) => {
    const [users, setUsers] = useState<User[]>([]) 
    const [admins, setAdmins] = useState<User[]>([]);
    const [restaurants, setRestaurants] = useState<User[]>([]);
    const [riders, setRiders] = useState<User[]>([]);
    const [clients, setClients] = useState<User[]>([]);
    const { isReady, isLogged } = useAuth();

    const updateAdmins = async () => {
        const { data } = await UserAPI.getAdmins();
        setAdmins(data);
    };

    const updateClients = async () => {
        const { data } = await UserAPI.getClients();
        setClients(data);
    };

    const updateRestaurants = async () => {
        const { data } = await UserAPI.getRestaurants();
        setRestaurants(data);
    };

    const updateRiders = async () => {
        const { data } = await UserAPI.getRiders();
        setRiders(data);
    };

    const updateAllUsers = async () => {
        const { data } = await UserAPI.getAll();
        setUsers(data);
    };

    useEffect(() => {
        if (!isReady || !isLogged) return;
        updateAllUsers();
        updateAdmins();
        updateClients();
        updateRestaurants();
        updateRiders();
    }, [isLogged, isReady]);

    return (
        <UserContext.Provider
            value={{
                users,
                updateAllUsers,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
