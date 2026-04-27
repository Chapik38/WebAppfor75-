const { createApp } = Vue;

createApp({
  data() {
    return {
      loading: false,
      error: '',
      form: { email: '', password: '' }
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = '';
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка входа');
        localStorage.setItem('token', data.token);
        window.location.href = '/builder';
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    }
  }
}).mount('#authApp');
