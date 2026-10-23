import { useEffect, useState } from 'react'
import { getDeviceProfile } from '../lib/devices'
import type { DeviceProfile } from '../lib/devices'

/** Returns the device capability profile and keeps it in sync on resize. */
export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(() => getDeviceProfile())

  useEffect(() => {
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setProfile({ ...getDeviceProfile() }))
    }
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  return profile
}
