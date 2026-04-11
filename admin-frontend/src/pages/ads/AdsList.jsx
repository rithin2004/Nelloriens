import { useEffect, useState } from 'react'
import { Settings, Link2, Link2Off, Loader, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import ModuleList from '../../components/common/ModuleList'
import FormModal from '../../components/common/FormModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import AdForm from '../../components/forms/AdForm'
import { adsApi } from '../../services/api'

const P  = '#0a3d95'
const PL = '#dce8fb'
const PB = '#eef3fd'

const inp = 'w-full px-3 py-2 text-sm rounded-xl focus:outline-none transition-all text-slate-700'
const inpS = { background: '#FFFFFF', border: '1px solid #CBD5E1' }
const focusOn  = (e) => { e.target.style.borderColor = P; e.target.style.boxShadow = '0 0 0 3px rgba(10,61,149,0.1)' }
const focusOff = (e) => { e.target.style.borderColor = '#CBD5E1'; e.target.style.boxShadow = '' }
const lbl = 'block text-xs font-semibold uppercase tracking-wide mb-1.5 text-slate-500'

export default function AdsList() {
  const [settings, setSettings]       = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [connectOpen, setConnectOpen] = useState(false)
  const [connectForm, setConnectForm] = useState({ publisherId: '', autoAdsEnabled: false })
  const [connecting, setConnecting]   = useState(false)
  const [disconnectOpen, setDisconnectOpen] = useState(false)
  const [disconnecting, setDisconnecting]   = useState(false)

  const fetchSettings = () => {
    setSettingsLoading(true)
    adsApi.getAdsenseSettings()
      .then((r) => setSettings(r.data || {}))
      .catch(() => setSettings({}))
      .finally(() => setSettingsLoading(false))
  }

  useEffect(() => { fetchSettings() }, [])

  const connected = !!settings?.publisherId

  const handleConnect = async (e) => {
    e.preventDefault()
    if (!connectForm.publisherId.trim()) { toast.error('Publisher ID is required'); return }
    setConnecting(true)
    try {
      await adsApi.connectAdsense(connectForm)
      toast.success('AdSense connected!')
      setConnectOpen(false)
      setConnectForm({ publisherId: '', autoAdsEnabled: false })
      fetchSettings()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Connect failed')
    } finally { setConnecting(false) }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await adsApi.disconnectAdsense()
      toast.success('AdSense disconnected')
      setDisconnectOpen(false)
      fetchSettings()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Disconnect failed')
    } finally { setDisconnecting(false) }
  }

  const handleToggleAutoAds = async () => {
    try {
      await adsApi.updateAdsense({ autoAdsEnabled: !settings.autoAdsEnabled })
      setSettings((p) => ({ ...p, autoAdsEnabled: !p.autoAdsEnabled }))
      toast.success('Auto Ads setting updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div className="animate-fade-in space-y-5">

      {/* AdSense Settings Card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#FFFFFF', border: `1px solid ${PL}`, boxShadow: '0 4px 16px rgba(10,61,149,0.06)' }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: PB }}>
              <Settings className="w-5 h-5" style={{ color: P }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Google AdSense</h2>
              {settingsLoading ? (
                <p className="text-xs text-slate-400">Loading…</p>
              ) : connected ? (
                <p className="text-xs text-slate-500">
                  Publisher ID: <span className="font-semibold text-slate-700">{settings.publisherId}</span>
                  {settings.autoAdsEnabled !== undefined && (
                    <span className="ml-2 text-slate-400">· Auto Ads: <span className={settings.autoAdsEnabled ? 'text-green-600 font-medium' : 'text-slate-400'}>{settings.autoAdsEnabled ? 'On' : 'Off'}</span></span>
                  )}
                </p>
              ) : (
                <p className="text-xs text-slate-400">Not connected — manual ads are active</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!settingsLoading && connected && (
              <>
                <button
                  onClick={handleToggleAutoAds}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all"
                  style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569' }}
                >
                  Auto Ads: {settings.autoAdsEnabled ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => setDisconnectOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all text-red-500 hover:text-red-700"
                  style={{ border: '1px solid #FECACA', background: '#FEF2F2' }}
                >
                  <Link2Off className="w-4 h-4" /> Disconnect
                </button>
              </>
            )}
            {!settingsLoading && !connected && (
              <button
                onClick={() => setConnectOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg"
                style={{ background: `linear-gradient(135deg,${P},#072d6e)`, boxShadow: '0 4px 12px rgba(10,61,149,0.25)' }}
              >
                <Link2 className="w-4 h-4" /> Connect AdSense
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manual Ads Section */}
      {!settingsLoading && connected ? (
        <div
          className="rounded-xl p-4 flex items-center gap-3 text-sm"
          style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-green-600" />
          <span className="text-green-800">
            AdSense is connected. Manual ads are disabled — your site uses Google AdSense to serve ads automatically.
          </span>
        </div>
      ) : (
        !settingsLoading && (
          <ModuleList title="Manual Ads" api={adsApi} FormComponent={AdForm} />
        )
      )}

      {/* Connect AdSense Modal */}
      <FormModal isOpen={connectOpen} onClose={() => setConnectOpen(false)} title="Connect Google AdSense" maxWidth="max-w-md">
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className={lbl}>Publisher ID *</label>
            <input
              className={inp} style={inpS} onFocus={focusOn} onBlur={focusOff}
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              value={connectForm.publisherId}
              onChange={(e) => setConnectForm((p) => ({ ...p, publisherId: e.target.value }))}
              required
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Find your Publisher ID in Google AdSense → Account → Account information.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="auto-ads"
              type="checkbox"
              checked={connectForm.autoAdsEnabled}
              onChange={(e) => setConnectForm((p) => ({ ...p, autoAdsEnabled: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="auto-ads" className="text-sm text-slate-700 font-medium cursor-pointer">
              Enable Auto Ads
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setConnectOpen(false)}
              className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100"
              style={{ border: '1px solid #E2E8F0' }}>Cancel</button>
            <button type="submit" disabled={connecting}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              style={{ background: `linear-gradient(135deg,${P},#072d6e)` }}>
              {connecting && <Loader className="w-4 h-4 animate-spin" />}
              {connecting ? 'Connecting…' : 'Connect'}
            </button>
          </div>
        </form>
      </FormModal>

      {/* Disconnect Confirm */}
      <ConfirmModal
        isOpen={disconnectOpen}
        title="Disconnect AdSense"
        message="This will remove your AdSense connection. Manual ads will be re-enabled."
        onConfirm={handleDisconnect}
        onCancel={() => setDisconnectOpen(false)}
        loading={disconnecting}
      />
    </div>
  )
}
