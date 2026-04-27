const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: false,
      error: '',
      form: { username: '', email: '', password: '' }
    };
  },
  methods: {
    async register() {
      this.loading = true;
      this.error = '';
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');
        localStorage.setItem('token', data.token);
        window.location.href = '/builder';
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    }
  }
}).mount('#registerApp');
