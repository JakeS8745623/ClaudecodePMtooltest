// ─── AUTHENTICATION HANDLER ───────────────────────────────────────────────────
// Requires @supabase/supabase-js UMD bundle loaded before this file.

const SUPABASE_URL = 'https://vklvzmfmsxonlxzzkbez.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2632xgQuFI8jmLqJL5J8tQ_1I77lSdt';

// Global Supabase client for authentication
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Handle form submission
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-submit-btn');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Visual feedback
    loginBtn.innerText = 'AUTHENTICATING...';
    loginBtn.disabled = true;

    try {
      // 1. Write a login function: supabase.auth.signInWithPassword({ email, password }).
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        // 5. If login fails, show an alert with the error message.
        alert('LOGIN ERROR: ' + error.message);
        loginBtn.innerText = 'SIGN IN';
        loginBtn.disabled = false;
        return;
      }

      // 4. On a successful login, redirect to index.html.
      if (data.session) {
        window.location.href = 'index.html';
      }

    } catch (err) {
      console.error('Fatal auth error:', err);
      alert('FATAL ERROR: ' + err.message);
      loginBtn.innerText = 'SIGN IN';
      loginBtn.disabled = false;
    }
  });
}
