// import { createContext } from 'react';
import { createContext, useEffect, useState, useCallback } from 'react';
import { StatsAPI } from '@/api/stats';
import useAuth from '@/hooks/useAuth';
// import useSocket from '@/hooks/useSocket';
import User from '@/types/User';
import Auth from '@/types/Auth';

interface IUsersStats {
  count: number;
  verified: number;
  enabled: number;
  male: number;
  clients: number;
  restaurants: number;
  riders: number;
}

interface IRidesStats {
  count: number;
  pending: number;
  finished: number;
  canceled: number;
  expired: number;
  revenues: number;
  fees: number;
  scheduled: number;
}

interface IFileTypeSizeStats {
  type: string;
  totalSize: number;
  total: number;
}

interface IOnlineStats {
  client: Auth[];
  restaurant: Auth[];
  rider: Auth[];
  admin: Auth[];
}

interface IDayStats {
  day: string;
  users: number;
}

interface IDbStats {
  db: string;
  collections: number;
  views: number;
  objects: number;
  avgObjSize: number;
  dataSize: number;
  storageSize: number;
  indexes: number;
  indexSize: number;
  totalSize: number;
  freeStorageSize: number;
  indexFreeStorageSize: number;
  totalFreeStorageSize: number;
  scaleFactor: number;
  fsUsedSize: number;
  fsTotalSize: number;
  ok: number;
}

interface IDeviceStats {
  os: string;
  devices: number;
}

interface ISmsStats {
  total: number;
  expired: number;
  consumed: number;
}

declare interface IStatsContext {
  users: IUsersStats;
  reviews: number;
  rides: IRidesStats;
  fileTypeSize: IFileTypeSizeStats[];
  online: IOnlineStats;
  lastWeekStats: IDayStats[];
  dbStats: IDbStats;
  devices: IDeviceStats[];
  sms: ISmsStats;
}

const initialState: IStatsContext = {
  users: {
    count: 0,
    verified: 0,
    enabled: 0,
    male: 0,
    clients: 0,
    restaurants: 0,
    riders: 0,
  },
  reviews: 0,
  rides: {
    count: 0,
    pending: 0,
    finished: 0,
    canceled: 0,
    expired: 0,
    revenues: 0,
    fees: 0,
    scheduled: 0,
  },
  fileTypeSize: [],
  online: {
    client: [],
    restaurant: [],
    rider: [],
    admin: [],
  },
  lastWeekStats: [],
  dbStats: {
    db: '',
    collections: 0,
    views: 0,
    objects: 0,
    avgObjSize: 0,
    dataSize: 0,
    storageSize: 0,
    indexes: 0,
    indexSize: 0,
    totalSize: 0,
    freeStorageSize: 0,
    indexFreeStorageSize: 0,
    totalFreeStorageSize: 0,
    scaleFactor: 0,
    fsUsedSize: 0,
    fsTotalSize: 0,
    ok: 0,
  },
  devices: [],
  sms: {
    total: 0,
    expired: 0,
    consumed: 0,
  },
};

export const StatsContext = createContext<IStatsContext>(initialState);

export default function StatsProvider({ children }: any) {
  const [users, setUsers] = useState<IUsersStats>(initialState.users);
  const [reviews, setReviews] = useState<number>(initialState.reviews);
  const [rides, setRides] = useState<IRidesStats>(initialState.rides);
  const [fileTypeSize, setFileTypeSize] = useState<IFileTypeSizeStats[]>(initialState.fileTypeSize);
  const [online, setOnline] = useState<IOnlineStats>(initialState.online);
  const [lastWeekStats, setLastWeekStats] = useState<IDayStats[]>(initialState.lastWeekStats);
  const [dbStats, setDbStats] = useState<IDbStats>(initialState.dbStats);
  const [devices, setDevices] = useState<IDeviceStats[]>(initialState.devices);
  const [sms, setSms] = useState<ISmsStats>(initialState.sms);

  // const { addListener, removeListener } = useSocket();
  const { isLogged, auth } = useAuth();

  useEffect(() => {
    if (!isLogged) return;
    RetrieveData();
  }, [isLogged]);

  const RetrieveData = async () => {
    const { data } = await StatsAPI.get();
    console.log("stats", data);
    setUsers(data.users);
    setReviews(data.reviews);
    setRides(data.rides);
    setFileTypeSize(data.fileTypeSize);
    setOnline(data.online);
    setLastWeekStats(data.lastWeekStats);
    setDbStats(data.dbStats);
    setSms(data.sms);
    setDevices(data.devices);
    
    console.log('data retrieved');
  };

  // useEffect(() => {
  //   addListener('adminStatusChanged', OnStatusChange);
  //   return () => removeListener('adminStatusChanged');
  // }, []);

  const OnStatusChange = () => {
    console.log('OnStatusChange');
    RetrieveData();
  };

  return (
    <StatsContext.Provider
      value={{ users, reviews, rides, fileTypeSize, online, lastWeekStats, dbStats, devices, sms }}
    >
      {children}
    </StatsContext.Provider>
  );
}
