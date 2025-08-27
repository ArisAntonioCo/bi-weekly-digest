'use client'

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'
import 'vanilla-cookieconsent/dist/cookieconsent.css'
import '@/styles/cookie-consent.css'

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    CookieConsent.run({
      // Main configuration
      guiOptions: {
        consentModal: {
          layout: 'cloud inline',
          position: 'bottom right',
          equalWeightButtons: true,
          flipButtons: false
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false
        }
      },

      // Cookie settings
      cookie: {
        name: 'bi_weekly_cookie_consent',
        domain: window.location.hostname,
        path: '/',
        sameSite: 'Lax',
        expiresAfterDays: 182
      },

      // Don't block page interaction
      disablePageInteraction: false,
      
      // Hide from bots
      hideFromBots: true,

      // Manage script tags
      manageScriptTags: true,

      // Categories configuration
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
          services: {
            supabase_auth: {
              label: 'Supabase Authentication',
              cookies: [
                {
                  name: /^sb-/
                }
              ]
            }
          }
        },
        analytics: {
          autoClear: {
            cookies: [
              {
                name: /^_ga/
              },
              {
                name: '_gid'
              }
            ]
          },
          services: {
            google_analytics: {
              label: 'Google Analytics',
              onAccept: () => {
                // Enable GA when we add it
                console.log('Analytics enabled')
              },
              onReject: () => {
                // Disable GA when we add it
                console.log('Analytics disabled')
              }
            }
          }
        },
        marketing: {
          autoClear: {
            cookies: [
              {
                name: /^_fb/
              }
            ]
          },
          services: {
            meta_pixel: {
              label: 'Meta Pixel',
              onAccept: () => {
                console.log('Marketing enabled')
              },
              onReject: () => {
                console.log('Marketing disabled')
              }
            }
          }
        }
      },

      // Language configuration
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'Cookie Settings',
              description: 'We use cookies to enhance your experience and analyze usage.',
              acceptAllBtn: 'Accept',
              acceptNecessaryBtn: 'Decline',
              showPreferencesBtn: 'Preferences',
              footer: `
                <a href="/cookie-policy">Cookie Policy</a>
                <a href="/privacy-policy">Privacy Policy</a>
              `
            },
            preferencesModal: {
              title: 'Cookie Preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close modal',
              serviceCounterLabel: 'Service|Services',
              sections: [
                {
                  title: 'Cookie Usage',
                  description: 'We use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want.'
                },
                {
                  title: 'Strictly Necessary Cookies',
                  description: 'These cookies are essential for the proper functioning of the website. They enable core features like user authentication and account management.',
                  linkedCategory: 'necessary',
                  cookieTable: {
                    headers: {
                      name: 'Name',
                      domain: 'Domain',
                      description: 'Description',
                      expiration: 'Expiration'
                    },
                    body: [
                      {
                        name: 'sb-*',
                        domain: location.hostname,
                        description: 'Supabase authentication cookies',
                        expiration: 'Session'
                      },
                      {
                        name: 'bi_weekly_cookie_consent',
                        domain: location.hostname,
                        description: 'Stores your cookie preferences',
                        expiration: '6 months'
                      }
                    ]
                  }
                },
                {
                  title: 'Analytics Cookies',
                  description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
                  linkedCategory: 'analytics',
                  cookieTable: {
                    headers: {
                      name: 'Name',
                      domain: 'Domain',
                      description: 'Description',
                      expiration: 'Expiration'
                    },
                    body: [
                      {
                        name: '_ga',
                        domain: location.hostname,
                        description: 'Google Analytics - Distinguishes unique users',
                        expiration: '2 years'
                      },
                      {
                        name: '_gid',
                        domain: location.hostname,
                        description: 'Google Analytics - Distinguishes users',
                        expiration: '24 hours'
                      }
                    ]
                  }
                },
                {
                  title: 'Marketing Cookies',
                  description: 'These cookies are used to track visitors across websites to display ads that are relevant and engaging for individual users.',
                  linkedCategory: 'marketing',
                  cookieTable: {
                    headers: {
                      name: 'Name',
                      domain: 'Domain',
                      description: 'Description',
                      expiration: 'Expiration'
                    },
                    body: [
                      {
                        name: '_fbp',
                        domain: location.hostname,
                        description: 'Meta Pixel - Used for advertising',
                        expiration: '3 months'
                      }
                    ]
                  }
                },
                {
                  title: 'More Information',
                  description: 'For any questions about our use of cookies, please <a href="/contact">contact us</a>.'
                }
              ]
            }
          }
        }
      }
    })
  }, [])

  return <>{children}</>
}