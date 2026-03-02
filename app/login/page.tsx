'use client'

import { useState } from 'react'
import { signIn, signUp } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string }
}) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] bg-warm-white rounded-modal shadow-card-lg p-9 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-ink mb-1">
            我的成长系统
          </h1>
          <p className="text-ink-muted text-sm tracking-wide">
            Personal Growth OS
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'text-ink border-b-2 border-ink'
                : 'text-ink-muted hover:text-ink-light'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              activeTab === 'register'
                ? 'text-ink border-b-2 border-ink'
                : 'text-ink-muted hover:text-ink-light'
            }`}
          >
            注册
          </button>
        </div>

        {/* Error Message */}
        {searchParams?.error && (
          <div className="mb-4 p-3 rounded-input bg-terracotta-light/30 border border-terracotta/20 text-sm text-terracotta">
            {searchParams.error}
          </div>
        )}

        {/* Success Message */}
        {searchParams?.message && (
          <div className="mb-4 p-3 rounded-input bg-sage-light/30 border border-sage/20 text-sm text-sage">
            {searchParams.message}
          </div>
        )}

        {/* Form */}
        <form action={activeTab === 'login' ? signIn : signUp}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5"
              >
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full border-[1.5px] border-border rounded-input p-3 text-sm bg-transparent text-ink placeholder:text-ink-muted/50 focus:border-gold focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-wider text-ink-muted mb-1.5"
              >
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="至少 6 个字符"
                className="w-full border-[1.5px] border-border rounded-input p-3 text-sm bg-transparent text-ink placeholder:text-ink-muted/50 focus:border-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-ink text-cream rounded-button py-3 text-sm font-medium hover:bg-ink-light active:scale-[0.98] transition-all"
          >
            {activeTab === 'login' ? '登录' : '注册'}
          </button>
        </form>

        {/* Footer hint */}
        <p className="text-center text-xs text-ink-muted mt-6">
          {activeTab === 'login'
            ? '还没有账号？点击上方「注册」标签'
            : '已有账号？点击上方「登录」标签'}
        </p>
      </div>
    </div>
  )
}
