'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
    const cookieStore = await cookies()
    cookieStore.set('windtodo-user-email', email, { path: '/' })
    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signup(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
    const cookieStore = await cookies()
    cookieStore.set('windtodo-user-email', email, { path: '/' })
    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
    const cookieStore = await cookies()
    cookieStore.delete('windtodo-user-email')
    redirect('/login')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
