//------------------------------------------------------------------------------
// <copyright file="Breadcrumbs.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) NotEasy.  All rights reserved.
// </copyright>                                                                
//------------------------------------------------------------------------------


import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


/// <summary>
/// Handle div click
/// </summary>


function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
}

function translatePath(name: string, t: any): string {
    switch (name) {
        case "dashboard":
            return t('navigation.dashboard');
        case "users":
            return t('navigation.users');
        case "categories":
            return t('navigation.categories');
        case "add":
            return t('common.add');
        case "clients":
            return t('navigation.clients');
        case "riders":
            return t('navigation.riders');
        case "restaurants":
            return t('navigation.restaurants');
        case "identities":
            return t('navigation.identities');
        case "configuration":
            return t('navigation.configuration');
        case "update":
            return t('common.edit');
        case "deliveries":
            return t('navigation.deliveries');
        case "auctions":
            return t('navigation.auctions');
        case "tenders":
            return t('navigation.tenders') || 'Appels d\'offres';
        case "create":
            return t('common.add');
        case "app":
            return t('navigation.dashboard');
        default:
            return name;
    }
}

/// <devdoc>
///    <para>  Breadcrumbs component to display page route. </para>
/// </devdoc>

interface BreadcrumbProps {
    customPathNames?: { [key: string]: string };
}

export default function Breadcrumb({ customPathNames = {} }: BreadcrumbProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    let paths: any[] = window.location.pathname.split('/').filter(x => x).slice()


    /// <summary>
    /// reformat data
    /// </summary>


    paths = paths.map((name, i) => {
        // Check if there's a custom name for this path segment
        const customName = customPathNames[name];
        const displayName = customName || translatePath(name, t);
        
        return {
            name: displayName,
            href: window.location.origin + "/" + paths.slice(0, i + 1).join('/'),
            path: paths.slice(0, i + 1).join('/')
        }
    })


    /// <summary>
    /// redirect to page
    /// </summary>


    const redirect = (p) => {
        if (p.name == t('navigation.dashboard')) navigate("/dashboard/app")
        else navigate("/" + p.path)
    }


    return (
        <div role="presentation" onClick={handleClick}>
            <Breadcrumbs aria-label="breadcrumb">
                {paths.map((p: any, i) => (
                    <Link key={i} underline="hover" href={p.href} onClick={() => redirect(p)}
                        color={i == paths.length - 1 ? "text.primary" : "inherit"}>
                        {p.name}
                    </Link>
                ))}
            </Breadcrumbs>
        </div >
    );
}
