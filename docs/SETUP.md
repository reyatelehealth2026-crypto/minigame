# Setup

## 1. Install
```bash
npm install
```

## 2. Configure env
Create `.env.local`:

```bash
NEXT_PUBLIC_LIFF_ID=your_liff_id
NEXT_PUBLIC_LINE_ADD_FRIEND_URL=https://line.me/R/ti/p/your_oa
```

## 3. Run dev server
```bash
npm run dev
```

## 4. Open key routes
- `/`
- `/liff/pharmacy-plus`

## Recommended next tasks
- connect real add-friend callback handling
- add Supabase schema and API persistence
- wire reward pool + claim logic
- add analytics event storage
