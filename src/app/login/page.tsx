
import { createClient } from '@/utils/supabase/server';
import { login, signup } from './actions'
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect('/');
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form className="flex flex-col gap-4">
        <label htmlFor="email">Email:</label>
        <input className="input input-bordered" id="email" name="email" type="email" required />
        <label htmlFor="password">Password:</label>
        <input className="input input-bordered" id="password" name="password" type="password" required />
        <button className="btn btn-primary" formAction={login}>Log in</button>
        <button className="btn btn-secondary" formAction={signup}>Sign up</button>
      </form>
    </div>
  )
}