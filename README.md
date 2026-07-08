# Nova Bank — Mobile Banking UI/UX Case Study 🏦✨

A modern mobile banking experience designed with a focus on security, financial clarity, and premium aesthetics.

This repository hosts a high-fidelity, interactive prototype created to bring the user flows, micro-interactions, and design systems outlined in my Figma case study to life.

---

### 🎨 Design & Prototyping
The core of this project is the UI/UX design. View the original design flow and clickable prototype here:
- **[Figma Interactive Prototype](https://www.figma.com/proto/UImyNLimZ9eL4jQsRzvFbX/My-workspace?node-id=647-17&viewport=6215%2C-742%2C0.7&t=8Y2g0ckOEjE8k7Cs-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1045%3A916&page-id=552%3A387&show-proto-sidebar=1)**

### 🚀 Live High-Fidelity Prototype
To truly experience the design as a user would, I facilitated the creation of a fully interactive web-based prototype:
- **[Live Interactive App (Vercel)](https://nova-bank-app-ebon.vercel.app/login)**

*Note: This live app is a high-fidelity simulation built using React and Tailwind CSS to demonstrate the UX logic and state management in a realistic environment.*

---

### 🌟 UX & Engineering Highlights Demonstrated
- **Interactive State Engineering**: Implemented a mandatory 3-step security gating system for PIN resets (`verify_old` &rarr; `set_new` &rarr; `confirm_new`) and a seamless Two-Factor Authentication intercept flow.
- **Smart Input Mechanics**: Engineered robust programmatic focus shifting and backspace routing for 4-digit PINs and 6-digit OTP fields to deliver frictionless, native-feeling interactions.
- **Global Error Infrastructure**: A centralized, animated `<ErrorBanner/>` that intercepts and handles negative path states (Network offline events, invalid auth attempts, transaction failures).
- **Design System Enforcement**: Strict adherence to a 1.25 (Major Third) typography scaling ratio and consistent 8px vertical rhythm constraints mapped natively to Tailwind utility classes.
- **Dynamic Feedback & Validation**: Real-time updates to UI elements (like spending insights) and intelligent form validation that guides the user visually and prevents frustration.

---
*This project is a showcase of Interface Design, User Experience, and Frontend Engineering.*