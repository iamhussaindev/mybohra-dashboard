# MyBohra Dashboard Documentation

Welcome to the MyBohra Dashboard documentation. This folder contains all the setup guides, module documentation, and technical references for the project.

## 📚 Documentation Index

### 🚀 Setup Guides

- **[Quick Setup Guide](./QUICK_SETUP.md)** - Get started quickly with sample tables and schema sync
- **[Schema Sync Guide](./SCHEMA_SYNC_GUIDE.md)** - Automatic TypeScript type generation from database schema
- **[Storage Setup](./STORAGE_SETUP.md)** - Configure Supabase storage buckets for audio and PDF files

### 🔐 Authentication & Security

- **[Email Whitelist Authentication](./AUTH_WHITELIST.md)** - Configure email whitelisting for Google OAuth

### 📅 Module Documentation

#### Location Module

- **[Location Module Guide](./LOCATION_MODULE.md)** - Complete guide for the location management system
- **[Location Module Summary](./LOCATION_MODULE_SUMMARY.md)** - Quick reference for location features

#### Miqaat Module (Islamic Calendar)

- **[Miqaat Setup Guide](./MIQAAT_SETUP_GUIDE.md)** - Setup guide for the miqaat (Islamic dates) module

## 🗂️ Project Structure

```
docs/
├── README.md                      # This file - documentation index
├── QUICK_SETUP.md                 # Quick start guide
├── SCHEMA_SYNC_GUIDE.md           # Schema sync documentation
├── STORAGE_SETUP.md               # Storage bucket setup
├── AUTH_WHITELIST.md              # Email whitelist authentication
├── LOCATION_MODULE.md             # Location module guide
├── LOCATION_MODULE_SUMMARY.md     # Location module summary
└── MIQAAT_SETUP_GUIDE.md          # Miqaat module setup
```

## 🔗 Related Documentation

### Database Documentation (in `/database` folder)

- SQL schemas for location and miqaat tables
- Database setup scripts
- Migration guides

### Scripts Documentation (in `/scripts` folder)

- Import scripts for library and miqaat data
- Database seeding utilities

## 🎯 Getting Started

1. **First Time Setup**

   - Start with [Quick Setup Guide](./QUICK_SETUP.md)
   - Configure [Storage Setup](./STORAGE_SETUP.md)
   - Set up [Email Whitelist](./AUTH_WHITELIST.md) for authentication

2. **Module Setup**

   - [Location Module](./LOCATION_MODULE.md) for location management
   - [Miqaat Module](./MIQAAT_SETUP_GUIDE.md) for Islamic calendar dates

3. **Development Tools**
   - [Schema Sync](./SCHEMA_SYNC_GUIDE.md) for automatic type generation

## 📝 Contributing to Documentation

When adding new documentation:

1. Place all `.md` files in the `docs/` folder
2. Update this README.md index
3. Use clear, descriptive filenames
4. Include code examples where helpful
5. Add troubleshooting sections

## 🆘 Need Help?

- Check the relevant guide in this folder
- Look for troubleshooting sections in each guide
- Review the main [README.md](../README.md) in the project root

---

**Last Updated**: 2024
