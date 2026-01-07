import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/login'

  console.log('[Email Confirmation] Received request:', {
    has_token_hash: !!token_hash,
    type,
    next,
    url: request.url
  })

  if (!token_hash || !type) {
    console.error('[Email Confirmation] Missing required parameters:', { token_hash: !!token_hash, type })
    return NextResponse.redirect(new URL(`/login?error=Missing confirmation parameters`, request.url))
  }

  try {
    const supabase = await createClient()

    console.log('[Email Confirmation] Verifying OTP...')
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (error) {
      console.error('[Email Confirmation] OTP verification error:', {
        message: error.message,
        status: error.status,
        name: error.name
      })
      
      // Handle specific error cases
      if (error.message?.includes('token has expired') || error.message?.includes('expired')) {
        return NextResponse.redirect(new URL(`/login?error=Confirmation link has expired. Please request a new one.`, request.url))
      }
      
      if (error.message?.includes('invalid') || error.message?.includes('already been used')) {
        return NextResponse.redirect(new URL(`/login?error=Invalid or already used confirmation link.`, request.url))
      }
      
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || 'Confirmation failed')}`, request.url))
    }
    
    if (!data?.user) {
      console.error('[Email Confirmation] No user data returned from verification')
      return NextResponse.redirect(new URL(`/login?error=Confirmation failed: No user data`, request.url))
    }

    console.log('[Email Confirmation] OTP verified successfully for user:', data.user.id)
    
    // Ensure user record exists in users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (userError) {
      console.error('[Email Confirmation] Error checking user record:', userError)
      // Continue anyway - user can still log in
    }

    if (!existingUser) {
      // Create user record if it doesn't exist
      const role = (data.user.user_metadata?.role as string) || 
                   (data.user.raw_user_meta_data?.role as string) || 
                   'student';
      
      console.log('[Email Confirmation] Creating user record with role:', role)
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email!,
            role: role,
            profile_data: data.user.user_metadata?.profile_data || data.user.raw_user_meta_data?.profile_data || {},
          },
        ]);

      if (insertError) {
        console.error('[Email Confirmation] Error creating user record:', insertError)
        // Continue anyway - user can still log in, but they might need admin help
        if (!insertError.message?.includes('duplicate') && !insertError.code?.includes('23505')) {
          console.warn('[Email Confirmation] User record creation failed but continuing with redirect')
        }
      } else {
        console.log('[Email Confirmation] User record created successfully')
      }
    } else if (!existingUser.role) {
      // Update role if it's missing
      const role = (data.user.user_metadata?.role as string) || 
                   (data.user.raw_user_meta_data?.role as string) || 
                   'student';
      
      console.log('[Email Confirmation] Updating user role to:', role)
      const { error: updateError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', data.user.id);
      
      if (updateError) {
        console.error('[Email Confirmation] Error updating user role:', updateError)
      }
    } else {
      console.log('[Email Confirmation] User record already exists with role:', existingUser.role)
    }

    // redirect user to specified redirect URL or login page
    console.log('[Email Confirmation] Redirecting to:', next)
    // redirect() throws a special error that Next.js catches - this is expected
    redirect(next)
  } catch (err: any) {
    // Check if this is a Next.js redirect (which is expected)
    if (err && typeof err === 'object' && 'digest' in err && typeof err.digest === 'string' && err.digest.includes('NEXT_REDIRECT')) {
      // This is the redirect - re-throw it so Next.js handles it
      throw err
    }
    // This is a real error - handle it
    console.error('[Email Confirmation] Unexpected error:', err)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err instanceof Error ? err.message : 'An unexpected error occurred')}`, request.url))
  }
}