import { useState, useMemo, useEffect } from 'react'
import './index.css'

const INITIAL_USERS = [
  { id: 1, username: 'engin', password: '123', name: 'Engin Koç', role: 'AUDITOR', avatar: '👨‍💼', location: 'Merkez Şube / İstanbul' },
  { id: 2, username: 'merve', password: '123', name: 'Merve Demir', role: 'AUDITOR', avatar: '👩‍🔬', location: 'Kadıköy Şube / İstanbul' },
  { id: 3, username: 'can', password: '123', name: 'Can Yılmaz', role: 'AUDITOR', avatar: '👨‍🔧', location: 'Beşiktaş Şube / İstanbul' },
  { id: 0, username: 'admin', password: 'admin', name: 'Yönetici', role: 'ADMIN', avatar: '👑', location: 'Genel Merkez' }
]

const AUDITORS = INITIAL_USERS.filter(u => u.role === 'AUDITOR')

const INITIAL_AUDIT_DATA = [
  {
    id: 'A',
    title: 'Salon & Bar Denetimi',
    items: [
      { id: 'a1', label: 'Genel Temizlik (Masa, sandalye düzeni)', weight: 1 },
      { id: 'a2', label: 'Hijyen Detayları (Menü, servis yüzeyleri)', weight: 1 },
      { id: 'a3', label: 'Ekipman Durumu (Blender, Kahve makinesi)', weight: 1 },
      { id: 'a4', label: 'Atık Yönetimi (Bar düzeni, çöpler)', weight: 1 },
    ]
  },
  {
    id: 'B',
    title: 'Mutfak & Tatlı İmalat',
    critical: true,
    items: [
      { id: 'b1', label: 'Gıda Güvenliği (SKT, etiketleme)', weight: 2 },
      { id: 'b2', label: 'Çapraz Bulaşma Kontrolü', weight: 2 },
      { id: 'b3', label: 'Fiziksel Koşullar (Zemin, duvarlar)', weight: 1 },
    ]
  },
  {
    id: 'C',
    title: 'Depo & Soğuk Hava Deposu',
    items: [
      { id: 'c1', label: 'İstifleme Düzeni (Raf temizliği)', weight: 1 },
      { id: 'c2', label: 'Stok Takibi', weight: 1 },
      { id: 'c3', label: 'Teknik Durum (Sızdırmazlık)', weight: 1 },
    ]
  },
  {
    id: 'D',
    title: 'Destek ve Ortak Alanlar',
    items: [
      { id: 'd1', label: 'Tuvaletler (Sarf malzeme, hijyen)', weight: 2 },
      { id: 'd2', label: 'Ortak Alanlar & Aydınlatma', weight: 1 },
    ]
  }
]

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loginRole, setLoginRole] = useState(null) // 'ADMIN' or 'AUDITOR' or null (landing)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })

  const [activeTab, setActiveTab] = useState('A')
  const [responses, setResponses] = useState({})
  const [history, setHistory] = useState([])
  const [viewingArchiveId, setViewingArchiveId] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [editingUser, setEditingUser] = useState(null)

  const [auditMeta, setAuditMeta] = useState(null)

  // Initialize data
  useEffect(() => {
    const savedHistory = localStorage.getItem('audit_history')
    if (savedHistory) setHistory(JSON.parse(savedHistory))

    const savedUsers = localStorage.getItem('audit_users')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      setUsers(INITIAL_USERS)
      localStorage.setItem('audit_users', JSON.stringify(INITIAL_USERS))
    }
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password && u.role === loginRole)
    if (user) {
      setCurrentUser(user)
      setLoginForm({ username: '', password: '' })
    } else {
      alert('Hatalı kullanıcı adı veya şifre!')
    }
  }

  const startNewAudit = () => {
    setAuditMeta({
      id: 'AUD-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString('tr-TR'),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      auditor: currentUser.name,
      auditorId: currentUser.id,
      location: currentUser.location,
      manager: 'Gökhan Kaya'
    })
    setResponses({})
    setActiveTab('A')
  }

  const handleUserUpdate = (userId, updates) => {
    const newUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u)
    setUsers(newUsers)
    localStorage.setItem('audit_users', JSON.stringify(newUsers))
    alert('Kullanıcı bilgileri güncellendi.')
  }

  const handleStatusChange = (itemId, status) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status }
    }))
  }

  const handleNoteChange = (itemId, note) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], note }
    }))
  }

  const handlePhotoUpload = (itemId, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setResponses(prev => ({
        ...prev,
        [itemId]: { ...prev[itemId], photo: reader.result }
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleAddCustomItem = (categoryId) => {
    const customId = 'custom-' + Date.now()
    setResponses(prev => ({
      ...prev,
      [customId]: {
        id: customId,
        categoryId,
        label: '',
        status: null,
        note: '',
        photo: null,
        isCustom: true
      }
    }))
  }

  const handleCustomLabelChange = (itemId, label) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], label }
    }))
  }

  const handleRemoveCustomItem = (itemId) => {
    if (window.confirm('Bu özel denetim maddesini silmek istediğinize emin misiniz?')) {
      setResponses(prev => {
        const newResponses = { ...prev }
        delete newResponses[itemId]
        return newResponses
      })
    }
  }

  const calculateScore = (auditResponses) => {
    let totalWeight = 0
    let earnedWeight = 0

    INITIAL_AUDIT_DATA.forEach(cat => {
      cat.items.forEach(item => {
        totalWeight += item.weight
        const res = auditResponses[item.id]
        if (res && res.status === 'good') {
          earnedWeight += item.weight
        }
      })
    })

    return totalWeight === 0 ? 100 : Math.round((earnedWeight / totalWeight) * 100)
  }

  const currentScore = useMemo(() => calculateScore(responses), [responses])

  const totalItemsCount = INITIAL_AUDIT_DATA.reduce((acc, cat) => acc + cat.items.length, 0)
  const completedItemsCount = Object.keys(responses).length
  const progressPercent = Math.round((completedItemsCount / totalItemsCount) * 100)

  const urgentItems = useMemo(() => {
    const list = []
    INITIAL_AUDIT_DATA.forEach(cat => {
      cat.items.forEach(item => {
        const res = responses[item.id]
        if (res && res.status === 'bad') {
          list.push({ ...item, category: cat.title })
        }
      })
    })
    return list
  }, [responses])

  const saveAudit = () => {
    const finalAudit = {
      ...auditMeta,
      score: currentScore,
      responses: responses,
      timestamp: Date.now(),
      auditorId: currentUser.id,
      role: currentUser.role
    }
    const newHistory = [finalAudit, ...history]
    setHistory(newHistory)
    localStorage.setItem('audit_history', JSON.stringify(newHistory))
    setCurrentUser(null)
    setViewingArchiveId(null)
    alert('Denetim başarıyla kaydedildi ve arşive eklendi.')
  }

  // Grouped History Logic
  const groupedHistory = useMemo(() => {
    const groups = {}
    history.forEach(audit => {
      const key = `${audit.auditorId}-${audit.date}`
      if (!groups[key]) {
        groups[key] = {
          id: key,
          auditor: audit.auditor,
          auditorId: audit.auditorId,
          date: audit.date,
          location: audit.location,
          audits: [],
          totalScore: 0
        }
      }
      groups[key].audits.push(audit)
      groups[key].totalScore += audit.score
    })

    return Object.values(groups).map(g => ({
      ...g,
      avgScore: Math.round(g.totalScore / g.audits.length)
    })).sort((a, b) => {
      // Sort by date (desc)
      const dateA = a.date.split('.').reverse().join('-')
      const dateB = b.date.split('.').reverse().join('-')
      return dateB.localeCompare(dateA)
    })
  }, [history])

  // Landing & Login Screen
  if (!currentUser) {
    if (!loginRole) {
      return (
        <div className="container login-screen">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Kafe Denetim Merkezi</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Yönetim ve Denetim Portalı</p>

          <div className="auditor-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '800px' }}>
            <div className="auditor-card glass-card" onClick={() => setLoginRole('ADMIN')}>
              <span className="auditor-avatar">👑</span>
              <div className="auditor-name">Yönetici Girişi</div>
              <div className="auditor-role">Sistem Yönetimi & Raporlama</div>
            </div>
            <div className="auditor-card glass-card" onClick={() => setLoginRole('AUDITOR')}>
              <span className="auditor-avatar">📝</span>
              <div className="auditor-name">Denetçi Girişi</div>
              <div className="auditor-role">Saha Denetimi & Veri Girişi</div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="container login-screen">
        <button className="back-btn" onClick={() => setLoginRole(null)} style={{ position: 'absolute', top: '2rem', left: '2rem' }}>← Geri</button>
        <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
          <h2>{loginRole === 'ADMIN' ? 'Yönetici' : 'Denetçi'} Girişi</h2>
          <form onSubmit={handleLogin} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Kullanıcı Adı</label>
              <input
                type="text"
                className="note-input"
                required
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Şifre</label>
              <input
                type="password"
                className="note-input"
                required
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Giriş Yap</button>
            {loginRole === 'AUDITOR' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                Demo için: engin / 123
              </p>
            )}
            {loginRole === 'ADMIN' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                Demo için: admin / admin
              </p>
            )}
          </form>
        </div>
      </div>
    )
  }

  // Admin Dashboard
  if (currentUser.role === 'ADMIN' && activeTab !== 'REPORT_LIST' && activeTab !== 'USER_MGMT' && !viewingArchiveId) {
    return (
      <div className="container">
        <header className="header glass-card" style={{ padding: '1.5rem' }}>
          <div>
            <h1>Yönetici Paneli</h1>
            <p>Hoş geldiniz, {currentUser.name}</p>
          </div>
          <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => setCurrentUser(null)}>Güvenli Çıkış</button>
        </header>

        <div className="auditor-grid" style={{ marginTop: '2rem' }}>
          <div className="auditor-card glass-card" onClick={() => setActiveTab('REPORT_LIST')}>
            <span className="auditor-avatar">📊</span>
            <div className="auditor-name">Tüm Denetimler</div>
            <div className="auditor-role">Günlük Raporları İncele</div>
          </div>
          <div className="auditor-card glass-card" onClick={() => setActiveTab('USER_MGMT')}>
            <span className="auditor-avatar">👥</span>
            <div className="auditor-name">Kullanıcı Yönetimi</div>
            <div className="auditor-role">Denetçi Bilgilerini Güncelle</div>
          </div>
        </div>
      </div>
    )
  }

  // Admin - User Management
  if (currentUser.role === 'ADMIN' && activeTab === 'USER_MGMT') {
    if (editingUser) {
      return (
        <div className="container">
          <header className="header glass-card" style={{ padding: '1.5rem' }}>
            <h1>Kullanıcı Düzenle: {editingUser.name}</h1>
            <button className="btn-primary" onClick={() => setEditingUser(null)}>Vazgeç</button>
          </header>

          <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUserUpdate(editingUser.id, editingUser)
              setEditingUser(null)
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              <div className="input-group">
                <label>Ad Soyad</label>
                <input
                  type="text"
                  className="note-input"
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Kullanıcı Adı (Giriş için)</label>
                <input
                  type="text"
                  className="note-input"
                  value={editingUser.username}
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Şifre</label>
                <input
                  type="text"
                  className="note-input"
                  value={editingUser.password}
                  onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Şube / Lokasyon Bilgisi</label>
                <input
                  type="text"
                  className="note-input"
                  value={editingUser.location}
                  onChange={e => setEditingUser({ ...editingUser, location: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem' }}>
                💾 Bilgileri Güncelle ve Kaydet
              </button>
            </form>
          </div>
        </div>
      )
    }

    return (
      <div className="container">
        <header className="header glass-card" style={{ padding: '1.5rem' }}>
          <h1>Kullanıcı Yönetimi</h1>
          <button className="btn-primary" onClick={() => setActiveTab('A')}>Paneli Dön</button>
        </header>

        <div className="history-list" style={{ marginTop: '2rem' }}>
          {users.filter(u => u.role === 'AUDITOR').map(user => (
            <div key={user.id} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{user.avatar}</span>
                  <div>
                    <h3 style={{ margin: 0 }}>{user.name}</h3>
                    <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      @{user.username} | 📍 {user.location}
                    </p>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1.5rem' }}
                  onClick={() => setEditingUser({ ...user })}
                >
                  Düzenle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Admin - All Reports List
  if (currentUser.role === 'ADMIN' && activeTab === 'REPORT_LIST' && !viewingArchiveId) {
    return (
      <div className="container">
        <header className="header glass-card" style={{ padding: '1.5rem' }}>
          <h1>Tüm Denetimler (Günlük Gruplanmış)</h1>
          <button className="btn-primary" onClick={() => setActiveTab('A')}>Paneli Dön</button>
        </header>

        <div className="history-list" style={{ marginTop: '2rem' }}>
          {groupedHistory.map(group => (
            <div key={group.id} className="history-item glass-card" onClick={() => setViewingArchiveId(group)}>
              <div className="history-main-info">
                <span className="history-id" style={{ fontSize: '0.9rem', opacity: 0.7 }}>Günlük Rapor</span>
                <div className="history-meta">
                  <span>👤 {group.auditor}</span>
                  <span>📅 {group.date}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({group.audits.length} Oturum)</span>
                </div>
              </div>
              <div className="history-score-badge" style={{
                background: group.avgScore > 70 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                color: group.avgScore > 70 ? 'var(--primary)' : 'var(--danger)'
              }}>%{group.avgScore}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Auditor Dashboard
  if (currentUser.role === 'AUDITOR' && !auditMeta && activeTab !== 'ARCHIVE' && !viewingArchiveId) {
    return (
      <div className="container">
        <header className="header glass-card" style={{ padding: '1.5rem' }}>
          <div>
            <h1>Hoş Geldin, {currentUser.name}</h1>
            <p>{currentUser.location}</p>
          </div>
          <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={() => setCurrentUser(null)}>Çıkış</button>
        </header>

        <div className="auditor-grid" style={{ marginTop: '2rem' }}>
          <div className="auditor-card glass-card" onClick={startNewAudit}>
            <span className="auditor-avatar">🆕</span>
            <div className="auditor-name">Yeni Denetim</div>
            <div className="auditor-role">Denetim Formunu Aç</div>
          </div>
          <div className="auditor-card glass-card" onClick={() => setActiveTab('ARCHIVE')}>
            <span className="auditor-avatar">📂</span>
            <div className="auditor-name">Geçmişim</div>
            <div className="auditor-role">Tamamlanan Denetimlerin</div>
          </div>
        </div>
      </div>
    )
  }

  // Auditor - Personal Archive
  if (currentUser.role === 'AUDITOR' && activeTab === 'ARCHIVE' && !viewingArchiveId) {
    const myGroupedHistory = groupedHistory.filter(g => g.auditorId === currentUser.id)
    return (
      <div className="container">
        <header className="header glass-card" style={{ padding: '1.5rem' }}>
          <h1>Geçmiş Denetimlerim</h1>
          <button className="btn-primary" onClick={() => setActiveTab('A')}>Dashboard'a Dön</button>
        </header>

        <div className="history-list" style={{ marginTop: '2rem' }}>
          {myGroupedHistory.length > 0 ? myGroupedHistory.map(group => (
            <div key={group.id} className="history-item glass-card" onClick={() => setViewingArchiveId(group)}>
              <div className="history-main-info">
                <span className="history-id" style={{ fontSize: '0.9rem', opacity: 0.7 }}>Günlük Özet</span>
                <div className="history-meta">
                  <span>📅 {group.date}</span>
                  <span style={{ fontSize: '0.8rem' }}>({group.audits.length} Denetim)</span>
                </div>
              </div>
              <div className="history-score-badge">%{group.avgScore}</div>
            </div>
          )) : (
            <p style={{ textAlign: 'center', opacity: 0.5 }}>Henüz bir denetim kaydınız yok.</p>
          )}
        </div>
      </div>
    )
  }

  // Detail View (Grouped/Single)
  if (viewingArchiveId) {
    const group = viewingArchiveId
    return (
      <div className="container detail-view">
        <button className="back-btn" onClick={() => setViewingArchiveId(null)}>← Liste Dön</button>

        <header className="header glass-card" style={{ padding: '2rem' }}>
          <div className="audit-info">
            <h1>Günlük Denetim Özeti - {group.date}</h1>
            <div className="audit-meta">
              <span>👤 {group.auditor}</span>
              <span>📍 {group.location}</span>
              <span>🔄 {group.audits.length} Oturum Birleştirildi</span>
            </div>
          </div>
          <div className="stat-item glass-card" style={{ minWidth: '150px' }}>
            <span className="stat-label">Ortalama Puan</span>
            <span className="stat-value" style={{ color: group.avgScore > 70 ? 'var(--primary)' : 'var(--danger)' }}>
              %{group.avgScore}
            </span>
          </div>
        </header>

        <div className="audit-sections">
          {INITIAL_AUDIT_DATA.map(cat => (
            <div key={cat.id} style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>{cat.title}</h2>
                {cat.critical && <span className="critical-badge">Kritik Alan</span>}
              </div>

              <div className="audit-grid">
                {cat.items.map(item => {
                  // Collect all responses for this item from all audits in the group
                  const itemResponses = group.audits
                    .map(a => a.responses[item.id])
                    .filter(res => res)

                  if (itemResponses.length === 0) {
                    return (
                      <div key={item.id} className="audit-item glass-card" style={{ opacity: 0.6, border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <div className="audit-item-header">
                          <span className="audit-item-title">{item.label}</span>
                        </div>
                        <div style={{ marginTop: '0.5rem', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '500' }}>
                          🚫 Bu denetim maddesi denetlenmedi veya içerik girilmedi.
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={item.id} className="audit-item glass-card">
                      <div className="audit-item-header">
                        <span className="audit-item-title">{item.label}</span>
                      </div>

                      <div className="response-history" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {itemResponses.map((res, idx) => (
                          <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span className={`toggle-btn ${res.status} active`} style={{ cursor: 'default', fontSize: '0.75rem' }}>
                                {res.status === 'good' ? 'İyi' : 'Kötü'}
                              </span>
                              <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Cevap #{idx + 1}</span>
                            </div>

                            {(res.note || res.photo) && (
                              <div className="observation-area" style={{ gridTemplateColumns: res.photo ? '1fr 100px' : '1fr', marginTop: '0.5rem' }}>
                                {res.note && <div className="note-display" style={{ fontSize: '0.8rem' }}>{res.note}</div>}
                                {res.photo && (
                                  <img
                                    src={res.photo}
                                    className="photo-preview"
                                    style={{ height: '60px', width: '100px', borderRadius: '8px' }}
                                    onClick={() => setSelectedImage(res.photo)}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Özel Maddeler (Gruptaki tüm oturumlardan) */}
                {Object.values(group.audits.reduce((acc, a) => {
                  Object.entries(a.responses).forEach(([rid, r]) => {
                    if (r.isCustom && r.categoryId === cat.id) {
                      acc[rid] = r;
                    }
                  });
                  return acc;
                }, {})).map(cRes => (
                  <div key={cRes.id} className="audit-item glass-card" style={{ border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <div className="audit-item-header">
                      <span className="audit-item-title" style={{ color: 'var(--secondary)' }}>{cRes.label || 'İsimsiz Madde'}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.5, background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Özel Madde</span>
                    </div>
                    <div className="response-history" style={{ marginTop: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span className={`toggle-btn ${cRes.status} active`} style={{ cursor: 'default', fontSize: '0.75rem' }}>
                            {cRes.status === 'good' ? 'İyi' : 'Kötü'}
                          </span>
                        </div>
                        {(cRes.note || cRes.photo) && (
                          <div className="observation-area" style={{ gridTemplateColumns: cRes.photo ? '1fr 100px' : '1fr', marginTop: '0.5rem' }}>
                            {cRes.note && <div className="note-display" style={{ fontSize: '0.8rem' }}>{cRes.note}</div>}
                            {cRes.photo && (
                              <img
                                src={cRes.photo}
                                className="photo-preview"
                                style={{ height: '60px', width: '100px', borderRadius: '8px' }}
                                onClick={() => setSelectedImage(cRes.photo)}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
              <img src={selectedImage} className="lightbox-image" alt="Büyük Görünüm" />
              <button className="lightbox-close" onClick={() => setSelectedImage(null)}>×</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Main Audit Screen
  const activeCategory = INITIAL_AUDIT_DATA.find(c => c.id === activeTab)

  return (
    <div className="container">
      <header className="header glass-card" style={{ padding: '1.5rem' }}>
        <div className="audit-info">
          <h1>{auditMeta.id} - Denetim Formu</h1>
          <div className="audit-meta">
            <span>� {auditMeta.auditor}</span>
            <span>� {auditMeta.date}</span>
            <span>📍 {auditMeta.location}</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <span className="stat-label">İlerleme: %{progressPercent}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>

        <div className="stats-panel">
          <div className="stat-item glass-card">
            <span className="stat-label">Anlık Puan</span>
            <span className="stat-value" style={{ color: currentScore > 70 ? 'var(--primary)' : 'var(--danger)' }}>
              %{currentScore}
            </span>
          </div>
          <button className="stat-item glass-card btn-primary" onClick={() => { setAuditMeta(null); setActiveTab('A'); }} style={{ cursor: 'pointer', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
            <span className="stat-label">Vazgeç</span>
            <span className="stat-value" style={{ fontSize: '1rem' }}>Denetimi İptal Et</span>
          </button>
        </div>
      </header>

      <nav className="tabs-nav">
        {INITIAL_AUDIT_DATA.map(cat => (
          <button
            key={cat.id}
            className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.id)}
          >
            {cat.title}
          </button>
        ))}
        <button
          className={`tab-btn ${activeTab === 'REPORT' ? 'active' : ''}`}
          onClick={() => setActiveTab('REPORT')}
          style={{ marginLeft: 'auto', border: '1px solid var(--secondary)' }}
        >
          📄 Denetimi Bitir
        </button>
      </nav>

      <main>
        {activeTab !== 'REPORT' ? (
          <>
            <div className="audit-grid">
              {activeCategory.items.map(item => {
                const res = responses[item.id] || {}
                return (
                  <div key={item.id} className="audit-item glass-card">
                    <div className="audit-item-header">
                      <span className="audit-item-title">{item.label}</span>
                      <div className="status-toggles">
                        <button
                          className={`toggle-btn good ${res.status === 'good' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(item.id, 'good')}
                        >
                          İyi
                        </button>
                        <button
                          className={`toggle-btn bad ${res.status === 'bad' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(item.id, 'bad')}
                        >
                          Kötü
                        </button>
                      </div>
                    </div>

                    {res.status && (
                      <div className="observation-area">
                        <textarea
                          className="note-input"
                          placeholder="Gözlemlenen bulguları buraya yazın..."
                          value={res.note || ''}
                          onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        />
                        <div className="photo-upload" onClick={() => document.getElementById(`file-${item.id}`).click()}>
                          {res.photo ? (
                            <img src={res.photo} alt="Bulgu" className="photo-preview" />
                          ) : (
                            <>
                              <span>📷</span>
                              <span>{res.status === 'bad' ? 'Fotoğraf Zorunlu' : 'Görsel Ekle'}</span>
                            </>
                          )}
                          <input
                            type="file"
                            id={`file-${item.id}`}
                            hidden
                            accept="image/*"
                            onChange={(e) => handlePhotoUpload(item.id, e.target.files[0])}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Özel Denetim Maddeleri */}
              {Object.values(responses).filter(r => r.isCustom && r.categoryId === activeTab).map(cItem => (
                <div key={cItem.id} className="audit-item glass-card" style={{ border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                  <div className="audit-item-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="audit-item-title" style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Özel Denetim Maddesi</span>
                      <button onClick={() => handleRemoveCustomItem(cItem.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    </div>
                    <input
                      type="text"
                      className="note-input"
                      placeholder="Denetlenen yeri/konuyu giriniz..."
                      style={{ padding: '0.75rem', fontWeight: 'bold' }}
                      value={cItem.label}
                      onChange={(e) => handleCustomLabelChange(cItem.id, e.target.value)}
                    />
                    <div className="status-toggles">
                      <button
                        className={`toggle-btn good ${cItem.status === 'good' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(cItem.id, 'good')}
                      >
                        İyi
                      </button>
                      <button
                        className={`toggle-btn bad ${cItem.status === 'bad' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(cItem.id, 'bad')}
                      >
                        Kötü
                      </button>
                    </div>
                  </div>

                  {cItem.status && (
                    <div className="observation-area">
                      <textarea
                        className="note-input"
                        placeholder="Gözlemlenen bulguları buraya yazın..."
                        value={cItem.note || ''}
                        onChange={(e) => handleNoteChange(cItem.id, e.target.value)}
                      />
                      <div className="photo-upload" onClick={() => document.getElementById(`file-${cItem.id}`).click()}>
                        {cItem.photo ? (
                          <img src={cItem.photo} alt="Bulgu" className="photo-preview" />
                        ) : (
                          <>
                            <span>📷</span>
                            <span>{cItem.status === 'bad' ? 'Fotoğraf Zorunlu' : 'Görsel Ekle'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          id={`file-${cItem.id}`}
                          hidden
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(cItem.id, e.target.files[0])}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
              <button
                className="btn-primary"
                style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed var(--secondary)', color: 'var(--secondary)', padding: '1rem 2rem' }}
                onClick={() => handleAddCustomItem(activeTab)}
              >
                ➕ Bu Kategoriye Yeni Madde Ekle
              </button>
            </div>
          </>
        ) : (
          <div className="dashboard-grid">
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2>Denetim Kapanış Paneli</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Tüm veriler girildi. Raporu onaylayıp arşive kaydedebilirsiniz.
              </p>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span>Tamamlanma Oranı:</span>
                  <span style={{ fontWeight: 700 }}>%{progressPercent}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <span>Genel Başarı Puanı:</span>
                  <span style={{ fontWeight: 700, color: currentScore > 70 ? 'var(--primary)' : 'var(--danger)' }}>%{currentScore}</span>
                </div>

                <h3>Kapanış Onayları</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ width: '20px', height: '20px' }} /> Denetim verilerinin doğruluğunu onaylıyorum.
                </label>
              </div>

              <button className="btn-primary" onClick={saveAudit} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                💾 Denetimi Tamamla ve Arşivle
              </button>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>⚠️ Takip Gereken Maddeler</h3>
              <div className="urgent-list">
                {urgentItems.length > 0 ? urgentItems.map(item => (
                  <div key={item.id} className="urgent-item">
                    <strong>[{item.category}]</strong><br />
                    {item.label}
                  </div>
                )) : (
                  <p style={{ color: 'var(--primary)' }}>Kritik bir hata saptanmadı.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} className="lightbox-image" alt="Büyük Görünüm" />
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
