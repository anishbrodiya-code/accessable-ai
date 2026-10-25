"use client";
import {supabase} from './supabase';
import {getEntries,saveEntry} from './storage';
import type {Entry} from './types';
export async function syncEntry(entry:Entry){saveEntry(entry);const db=supabase();if(!db)return;const {data:{user}}=await db.auth.getUser();if(!user)return;const {error}=await db.from('documents').upsert({id:entry.id,user_id:user.id,entry,updated_at:new Date().toISOString()});if(error)throw new Error('Saved locally, but cloud sync failed: '+error.message)}
export async function importGuestEntries(){const db=supabase();if(!db)throw Error('Supabase is not configured');const {data:{user}}=await db.auth.getUser();if(!user)throw Error('Please sign in first');const entries=getEntries();for(const entry of entries){const {error}=await db.from('documents').upsert({id:entry.id,user_id:user.id,entry,updated_at:new Date().toISOString()},{onConflict:'id'});if(error)throw Error('Import stopped: '+error.message)}return entries.length}
export async function cloudEntries(){const db=supabase();if(!db)return getEntries();const {data:{user}}=await db.auth.getUser();if(!user)return getEntries();const {data,error}=await db.from('documents').select('entry').order('updated_at',{ascending:false});if(error)throw Error(error.message);return (data||[]).map(row=>row.entry as Entry)}
export async function deleteCloudEntry(id:string){const db=supabase();if(db){const {data:{user}}=await db.auth.getUser();if(user){const {error}=await db.from('documents').delete().eq('id',id);if(error)throw Error(error.message)}}}
