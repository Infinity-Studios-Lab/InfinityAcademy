import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getRole() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) {
        throw new Error(error.message)
    }
    return data.user?.role
}