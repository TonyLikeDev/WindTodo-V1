'use server'

import { auth } from '@/lib/auth'
import { APIError } from 'better-auth/api'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    })
  } catch (e) {
    if (e instanceof APIError) {
      return { error: e.message }
    }
    return { error: 'Invalid email or password' }
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

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: email.split('@')[0],
      },
      headers: await headers(),
    })
  } catch (e) {
    if (e instanceof APIError) {
      return { error: e.message }
    }
    return { error: 'Failed to create account' }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  })
  redirect('/login')
}
