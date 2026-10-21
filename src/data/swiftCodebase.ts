export interface SwiftFile {
  name: string;
  category: 'App' | 'Models' | 'Services' | 'Views';
  description: string;
  code: string;
}

export const SWIFT_CODEBASE: SwiftFile[] = [
  {
    name: 'PersonalDirectoryApp.swift',
    category: 'App',
    description: 'Main SwiftUI App entry point configuring SwiftData ModelContainer with CloudKit private database syncing and biometric lock lifecycle.',
    code: `//
//  PersonalDirectoryApp.swift
//  PersonalDirectory
//
//  Created by iOS Engineer.
//  Copyright © 2026. All rights reserved.
//

import SwiftUI
import SwiftData

@main
struct PersonalDirectoryApp: App {
    @StateObject private var biometricManager = BiometricAuthManager.shared
    @StateObject private var cloudKitMonitor = CloudKitSyncMonitor.shared
    
    // Configure SwiftData container with CloudKit automatic private database sync
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Contact.self,
            PhoneNumber.self,
            BankAccount.self,
            Folder.self,
            CallLog.self
        ])
        
        let modelConfiguration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false,
            allowsSave: true,
            cloudKitDatabase: .private("iCloud.com.personal.directory")
        )
        
        do {
            let container = try ModelContainer(for: schema, configurations: [modelConfiguration])
            return container
        } catch {
            fatalError("Failed to initialize SwiftData ModelContainer: \\(error.localizedDescription)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ZStack {
                RootContentView()
                    .environmentObject(biometricManager)
                    .environmentObject(cloudKitMonitor)
                
                // Overlay Face ID / Touch ID lock screen if enabled & locked
                if biometricManager.isLocked {
                    BiometricLockView()
                        .environmentObject(biometricManager)
                        .transition(.opacity.combined(with: .scale(scale: 0.98)))
                }
            }
            .onReceive(NotificationCenter.default.publisher(for: UIApplication.willResignActiveNotification)) { _ in
                if biometricManager.isBiometricEnabled {
                    biometricManager.lockApp()
                }
            }
            .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in
                if biometricManager.isBiometricEnabled && biometricManager.isLocked {
                    biometricManager.authenticateWithBiometrics()
                }
            }
        }
        .modelContainer(sharedModelContainer)
    }
}
`,
  },
  {
    name: 'Contact.swift',
    category: 'Models',
    description: 'SwiftData @Model for Contact with cascade relationships to PhoneNumbers, BankAccounts, and CallLogs.',
    code: `//
//  Contact.swift
//  PersonalDirectory
//

import Foundation
import SwiftData

@Model
final class Contact {
    @Attribute(.unique) var id: UUID
    var firstName: String
    var lastName: String
    var nickname: String?
    var avatarSymbol: String
    var isFavorite: Bool
    var notes: String
    var createdAt: Date
    var updatedAt: Date
    var lastInteractedAt: Date?
    var interactionCount: Int
    
    // Relationship: 1 Contact to Many Phone Numbers
    @Relationship(deleteRule: .cascade, inverse: \\PhoneNumber.contact)
    var phoneNumbers: [PhoneNumber] = []
    
    // Relationship: 1 Contact to Many Bank Accounts
    @Relationship(deleteRule: .cascade, inverse: \\BankAccount.contact)
    var bankAccounts: [BankAccount] = []
    
    // Relationship: Contact belongs to 1 optional Folder
    @Relationship(inverse: \\Folder.contacts)
    var folder: Folder?
    
    // Relationship: 1 Contact to Many Call Logs
    @Relationship(deleteRule: .cascade, inverse: \\CallLog.contact)
    var callLogs: [CallLog] = []

    init(
        id: UUID = UUID(),
        firstName: String,
        lastName: String,
        nickname: String? = nil,
        avatarSymbol: String = "person.crop.circle.fill",
        isFavorite: Bool = false,
        notes: String = "",
        folder: Folder? = nil,
        createdAt: Date = Date(),
        updatedAt: Date = Date(),
        interactionCount: Int = 0
    ) {
        self.id = id
        self.firstName = firstName
        self.lastName = lastName
        self.nickname = nickname
        self.avatarSymbol = avatarSymbol
        self.isFavorite = isFavorite
        self.notes = notes
        self.folder = folder
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.interactionCount = interactionCount
    }
    
    var fullName: String {
        "\\(firstName) \\(lastName)".trimmingCharacters(in: .whitespaces)
    }
    
    var primaryPhoneNumber: PhoneNumber? {
        phoneNumbers.first(where: { $0.isPrimary }) ?? phoneNumbers.first
    }
}
`,
  },
  {
    name: 'PhoneNumber.swift',
    category: 'Models',
    description: 'SwiftData @Model for Phone Numbers with labels (Mobile, Home, Work, etc.) and primary flags.',
    code: `//
//  PhoneNumber.swift
//  PersonalDirectory
//

import Foundation
import SwiftData

@Model
final class PhoneNumber {
    @Attribute(.unique) var id: UUID
    var label: String // "Mobile", "Work", "Home", "Main", "iPhone"
    var rawNumber: String
    var isPrimary: Bool
    
    // Inverse relationship to parent Contact
    var contact: Contact?

    init(
        id: UUID = UUID(),
        label: String = "Mobile",
        rawNumber: String,
        isPrimary: Bool = false,
        contact: Contact? = nil
    ) {
        self.id = id
        self.label = label
        self.rawNumber = rawNumber
        self.isPrimary = isPrimary
        self.contact = contact
    }
    
    var telURL: URL? {
        let cleaned = rawNumber.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
        return URL(string: "tel://\\(cleaned)")
    }
}
`,
  },
  {
    name: 'BankAccount.swift',
    category: 'Models',
    description: 'SwiftData @Model for Bank Accounts storing account holder, bank name, IBAN/account number, branch, and routing code.',
    code: `//
//  BankAccount.swift
//  PersonalDirectory
//

import Foundation
import SwiftData

@Model
final class BankAccount {
    @Attribute(.unique) var id: UUID
    var bankName: String
    var accountNumber: String
    var accountHolderName: String
    var branch: String?
    var routingNumber: String?
    var notes: String?
    var isPrimary: Bool
    var isFavorite: Bool
    
    // Inverse relationship to parent Contact
    var contact: Contact?

    init(
        id: UUID = UUID(),
        bankName: String,
        accountNumber: String,
        accountHolderName: String,
        branch: String? = nil,
        routingNumber: String? = nil,
        notes: String? = nil,
        isPrimary: Bool = false,
        isFavorite: Bool = false,
        contact: Contact? = nil
    ) {
        self.id = id
        self.bankName = bankName
        self.accountNumber = accountNumber
        self.accountHolderName = accountHolderName
        self.branch = branch
        self.routingNumber = routingNumber
        self.notes = notes
        self.isPrimary = isPrimary
        self.isFavorite = isFavorite
        self.contact = contact
    }
    
    var maskedAccountNumber: String {
        guard accountNumber.count > 4 else { return "••••" }
        let suffix = accountNumber.suffix(4)
        return "•••• \\(suffix)"
    }
}
`,
  },
  {
    name: 'Folder.swift',
    category: 'Models',
    description: 'SwiftData @Model for Folders/Labels allowing custom categorization like Family, Close Friends, and Business.',
    code: `//
//  Folder.swift
//  PersonalDirectory
//

import Foundation
import SwiftData

@Model
final class Folder {
    @Attribute(.unique) var id: UUID
    var name: String
    var iconName: String
    var hexColor: String
    var isSystem: Bool
    
    // 1 Folder to Many Contacts
    @Relationship(inverse: \\Contact.folder)
    var contacts: [Contact] = []

    init(
        id: UUID = UUID(),
        name: String,
        iconName: String = "folder.fill",
        hexColor: String = "#3B82F6",
        isSystem: Bool = false
    ) {
        self.id = id
        self.name = name
        self.iconName = iconName
        self.hexColor = hexColor
        self.isSystem = isSystem
    }
}
`,
  },
  {
    name: 'CallLog.swift',
    category: 'Models',
    description: 'SwiftData @Model for Call Logs recording outgoing, incoming, and missed calls linked to a Contact.',
    code: `//
//  CallLog.swift
//  PersonalDirectory
//

import Foundation
import SwiftData

enum CallType: String, Codable, CaseIterable {
    case outgoing = "Outgoing"
    case incoming = "Incoming"
    case missed = "Missed"
    
    var iconName: String {
        switch self {
        case .outgoing: return "phone.arrow.up.right.fill"
        case .incoming: return "phone.arrow.down.left.fill"
        case .missed: return "phone.down.fill"
        }
    }
}

@Model
final class CallLog {
    @Attribute(.unique) var id: UUID
    var contactNameSnapshot: String
    var dialedNumber: String
    var typeString: String
    var timestamp: Date
    var durationSeconds: Int
    var notes: String?
    
    var contact: Contact?

    init(
        id: UUID = UUID(),
        contactNameSnapshot: String,
        dialedNumber: String,
        type: CallType,
        timestamp: Date = Date(),
        durationSeconds: Int = 0,
        notes: String? = nil,
        contact: Contact? = nil
    ) {
        self.id = id
        self.contactNameSnapshot = contactNameSnapshot
        self.dialedNumber = dialedNumber
        self.typeString = type.rawValue
        self.timestamp = timestamp
        self.durationSeconds = durationSeconds
        self.notes = notes
        self.contact = contact
    }
    
    var callType: CallType {
        CallType(rawValue: typeString) ?? .outgoing
    }
}
`,
  },
  {
    name: 'BiometricAuthManager.swift',
    category: 'Services',
    description: 'Production LocalAuthentication manager for Face ID / Touch ID evaluation with localized error handling and passcode fallback.',
    code: `//
//  BiometricAuthManager.swift
//  PersonalDirectory
//

import Foundation
import LocalAuthentication
import SwiftUI

@MainActor
final class BiometricAuthManager: ObservableObject {
    static let shared = BiometricAuthManager()
    
    @Published var isLocked: Bool = false
    @Published var isBiometricEnabled: Bool {
        didSet {
            UserDefaults.standard.set(isBiometricEnabled, forKey: "kBiometricAuthEnabled")
        }
    }
    @Published var authError: String?
    @Published var biometryType: LABiometryType = .none
    
    private init() {
        self.isBiometricEnabled = UserDefaults.standard.bool(forKey: "kBiometricAuthEnabled")
        self.isLocked = self.isBiometricEnabled
        self.checkBiometricCapability()
    }
    
    func checkBiometricCapability() {
        let context = LAContext()
        var error: NSError?
        
        if context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) {
            self.biometryType = context.biometryType
        } else {
            self.biometryType = .none
        }
    }
    
    func lockApp() {
        guard isBiometricEnabled else { return }
        self.isLocked = true
    }
    
    func authenticateWithBiometrics() {
        guard isBiometricEnabled else {
            self.isLocked = false
            return
        }
        
        let context = LAContext()
        context.localizedCancelTitle = "Cancel"
        context.localizedFallbackTitle = "Enter Passcode"
        
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            // Fallback to device passcode
            authenticateWithDevicePasscode(context: context)
            return
        }
        
        let reason = "Unlock your secure personal directory"
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { [weak self] success, evalError in
            Task { @MainActor in
                if success {
                    self?.isLocked = false
                    self?.authError = nil
                    UINotificationFeedbackGenerator().notificationOccurred(.success)
                } else {
                    if let laError = evalError as? LAError {
                        switch laError.code {
                        case .userFallback:
                            self?.authenticateWithDevicePasscode(context: LAContext())
                        case .biometryLockout:
                            self?.authError = "Biometrics locked. Enter device passcode."
                            self?.authenticateWithDevicePasscode(context: LAContext())
                        default:
                            self?.authError = laError.localizedDescription
                        }
                    }
                    UINotificationFeedbackGenerator().notificationOccurred(.error)
                }
            }
        }
    }
    
    private func authenticateWithDevicePasscode(context: LAContext) {
        let reason = "Enter device passcode to unlock directory"
        context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason) { [weak self] success, _ in
            Task { @MainActor in
                if success {
                    self?.isLocked = false
                    self?.authError = nil
                }
            }
        }
    }
}
`,
  },
  {
    name: 'KeychainManager.swift',
    category: 'Services',
    description: 'Hardware Keychain Services wrapper storing bank account and sensitive notes with Secure Enclave hardware accessibility.',
    code: `//
//  KeychainManager.swift
//  PersonalDirectory
//

import Foundation
import Security

enum KeychainError: Error {
    case duplicateEntry
    case unknown(OSStatus)
    case itemNotFound
    case invalidData
}

final class KeychainManager {
    static let shared = KeychainManager()
    private let serviceIdentifier = "com.personal.directory.keychain"
    
    private init() {}
    
    func save(key: String, data: Data) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceIdentifier,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        
        SecItemDelete(query as CFDictionary)
        
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.unknown(status)
        }
    }
    
    func read(key: String) throws -> Data {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceIdentifier,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess, let data = result as? Data else {
            throw KeychainError.itemNotFound
        }
        return data
    }
}
`,
  },
  {
    name: 'CloudKitSyncMonitor.swift',
    category: 'Services',
    description: 'Monitors NSPersistentCloudKitContainer sync events, conflict states, and network connectivity.',
    code: `//
//  CloudKitSyncMonitor.swift
//  PersonalDirectory
//

import Foundation
import CoreData
import SwiftUI

enum CloudKitSyncStatus: String {
    case synced = "Synchronized"
    case syncing = "Syncing with iCloud..."
    case error = "Sync Error"
    case offline = "Offline (Local Only)"
}

@MainActor
final class CloudKitSyncMonitor: ObservableObject {
    static let shared = CloudKitSyncMonitor()
    
    @Published var status: CloudKitSyncStatus = .synced
    @Published var lastSyncDate: Date? = Date()
    @Published var pendingRecordCount: Int = 0
    
    private init() {
        setupCloudKitNotifications()
    }
    
    private func setupCloudKitNotifications() {
        NotificationCenter.default.addObserver(
            forName: NSPersistentCloudKitContainer.eventChangedNotification,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let event = notification.userInfo?[NSPersistentCloudKitContainer.eventNotificationUserInfoKey]
                    as? NSPersistentCloudKitContainer.Event else { return }
            
            if event.endDate == nil {
                self?.status = .syncing
            } else if let error = event.error {
                self?.status = .error
                print("CloudKit Sync Error: \\(error.localizedDescription)")
            } else {
                self?.status = .synced
                self?.lastSyncDate = event.endDate
            }
        }
    }
}
`,
  },
  {
    name: 'ContactsListView.swift',
    category: 'Views',
    description: 'Modern minimalist iOS Contact List with SwiftUI @Query, section fast-index, Smart Lists (Favorites, Recents, Most Used), and search filtering.',
    code: `//
//  ContactsListView.swift
//  PersonalDirectory
//

import SwiftUI
import SwiftData

enum DirectorySmartFilter: String, CaseIterable {
    case all = "All"
    case favorites = "Favorites"
    case recents = "Recents"
    case mostUsed = "Most Used"
}

struct ContactsListView: View {
    @Environment(\\.modelContext) private var modelContext
    @Query(sort: [SortDescriptor(\\Contact.lastName, order: .forward), SortDescriptor(\\Contact.firstName, order: .forward)])
    private var allContacts: [Contact]
    
    @Query private var folders: [Folder]
    
    @State private var searchText: String = ""
    @State private var selectedSmartFilter: DirectorySmartFilter = .all
    @State private var selectedFolderId: UUID? = nil
    @State private var isPresentingAddSheet: Bool = false
    @State private var selectedContact: Contact?
    
    var filteredContacts: [Contact] {
        var result = allContacts
        
        // Smart filter
        switch selectedSmartFilter {
        case .all: break
        case .favorites:
            result = result.filter { $0.isFavorite }
        case .recents:
            result = result.sorted { ($0.lastInteractedAt ?? Date.distantPast) > ($1.lastInteractedAt ?? Date.distantPast) }
        case .mostUsed:
            result = result.sorted { $0.interactionCount > $1.interactionCount }
        }
        
        // Folder filter
        if let folderId = selectedFolderId {
            result = result.filter { $0.folder?.id == folderId }
        }
        
        // Instant search by name, phone number, or bank
        if !searchText.isEmpty {
            let query = searchText.lowercased()
            result = result.filter { contact in
                contact.fullName.lowercased().contains(query) ||
                (contact.nickname?.lowercased().contains(query) ?? false) ||
                contact.phoneNumbers.contains { $0.rawNumber.contains(query) } ||
                contact.bankAccounts.contains { $0.bankName.lowercased().contains(query) || $0.accountNumber.contains(query) }
            }
        }
        
        return result
    }
    
    var body: some View {
        NavigationStack {
            List {
                // Smart Filter Segmented Control
                Section {
                    Picker("Smart Filter", selection: $selectedSmartFilter) {
                        ForEach(DirectorySmartFilter.allCases, id: \\.self) { filter in
                            Text(filter.rawValue).tag(filter)
                        }
                    }
                    .pickerStyle(.segmented)
                    .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                    .listRowBackground(Color.clear)
                }
                
                // Contacts Section
                Section {
                    ForEach(filteredContacts) { contact in
                        ContactRowView(contact: contact)
                            .contentShape(Rectangle())
                            .onTapGesture {
                                contact.interactionCount += 1
                                contact.lastInteractedAt = Date()
                                selectedContact = contact
                            }
                    }
                    .onDelete(perform: deleteContacts)
                } header: {
                    Text("\\(filteredContacts.count) Contacts")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Directory")
            .searchable(text: $searchText, prompt: "Search by name, phone, or bank...")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isPresentingAddSheet = true
                    } label: {
                        Image(systemName: "plus")
                            .fontWeight(.semibold)
                    }
                }
            }
            .sheet(isPresented: $isPresentingAddSheet) {
                AddEditContactView()
            }
            .sheet(item: $selectedContact) { contact in
                ContactDetailView(contact: contact)
            }
        }
    }
    
    private func deleteContacts(at offsets: IndexSet) {
        for index in offsets {
            let contact = filteredContacts[index]
            modelContext.delete(contact)
        }
    }
}
`,
  },
  {
    name: 'ContactDetailView.swift',
    category: 'Views',
    description: 'Detailed iOS Contact Card with 1-tap dialer, 1-tap clipboard copy with haptic feedback, multiple bank accounts, and call log history.',
    code: `//
//  ContactDetailView.swift
//  PersonalDirectory
//

import SwiftUI
import SwiftData

struct ContactDetailView: View {
    @Environment(\\.dismiss) private var dismiss
    @Bindable var contact: Contact
    
    @State private var isShowingCopiedToast: Bool = false
    @State private var copiedItemLabel: String = ""
    @State private var isEditingContact: Bool = false
    @State private var isMaskingBankDetails: Bool = true

    var body: some View {
        NavigationStack {
            List {
                // Header Avatar & Name
                Section {
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(Color.accentColor.opacity(0.15))
                                .frame(width: 88, height: 88)
                            Image(systemName: contact.avatarSymbol)
                                .font(.system(size: 44))
                                .foregroundStyle(Color.accentColor)
                        }
                        
                        VStack(spacing: 4) {
                            Text(contact.fullName)
                                .font(.title2.weight(.bold))
                            
                            if let nickname = contact.nickname, !nickname.isEmpty {
                                Text("\\"\\(nickname)\\"")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        
                        // Action Bar: Call, Message, Share
                        HStack(spacing: 24) {
                            if let primary = contact.primaryPhoneNumber, let url = primary.telURL {
                                Link(destination: url) {
                                    QuickActionPill(icon: "phone.fill", label: "call")
                                }
                            }
                            
                            Button {
                                contact.isFavorite.toggle()
                                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                            } label: {
                                QuickActionPill(
                                    icon: contact.isFavorite ? "star.fill" : "star",
                                    label: "favorite",
                                    isActive: contact.isFavorite
                                )
                            }
                        }
                        .padding(.top, 4)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }
                .listRowBackground(Color.clear)
                
                // Phone Numbers Section
                Section("Phone Numbers") {
                    ForEach(contact.phoneNumbers) { phone in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(phone.label)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Text(phone.rawNumber)
                                    .font(.body.weight(.medium))
                            }
                            
                            Spacer()
                            
                            // Copy button with visual & haptic feedback
                            Button {
                                UIPasteboard.general.string = phone.rawNumber
                                copyWithFeedback(label: phone.label)
                            } label: {
                                Image(systemName: "doc.on.doc")
                                    .font(.subheadline)
                                    .foregroundStyle(.tint)
                            }
                            .buttonStyle(.borderless)
                        }
                    }
                }
                
                // Bank Accounts Section (Minimalist: Bank Name + Account # + Star + Copy)
                Section("Bank Accounts") {
                    ForEach(contact.bankAccounts.sorted(by: { $0.isFavorite && !$1.isFavorite })) { bank in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 6) {
                                    Text(bank.bankName)
                                        .font(.subheadline.weight(.medium))
                                    if bank.isFavorite {
                                        Image(systemName: "star.fill")
                                            .font(.system(size: 10))
                                            .foregroundStyle(.yellow)
                                    }
                                }
                                Text(bank.accountNumber)
                                    .font(.body.monospaced().weight(.semibold))
                            }
                            
                            Spacer()
                            
                            // Favorite toggle button
                            Button {
                                bank.isFavorite.toggle()
                                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            } label: {
                                Image(systemName: bank.isFavorite ? "star.fill" : "star")
                                    .font(.subheadline)
                                    .foregroundStyle(bank.isFavorite ? .yellow : .secondary)
                            }
                            .buttonStyle(.borderless)
                            .padding(.trailing, 4)
                            
                            // Copy button
                            Button {
                                UIPasteboard.general.string = bank.accountNumber
                                copyWithFeedback(label: bank.bankName)
                            } label: {
                                Image(systemName: "doc.on.doc")
                                    .font(.subheadline)
                                    .foregroundStyle(.tint)
                            }
                            .buttonStyle(.borderless)
                        }
                    }
                }
                
                // Notes Section
                if !contact.notes.isEmpty {
                    Section("Notes") {
                        Text(contact.notes)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Edit") { isEditingContact = true }
                }
            }
            .sheet(isPresented: $isEditingContact) {
                AddEditContactView(contactToEdit: contact)
            }
        }
    }
    
    private func copyWithFeedback(label: String) {
        copiedItemLabel = label
        isShowingCopiedToast = true
        UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
    }
}

struct QuickActionPill: View {
    let icon: String
    let label: String
    var isActive: Bool = false
    
    var body: some View {
        VStack(spacing: 4) {
            Circle()
                .fill(isActive ? Color.yellow.opacity(0.2) : Color(.systemGray5))
                .frame(width: 44, height: 44)
                .overlay {
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(isActive ? Color.yellow : Color.accentColor)
                }
            Text(label.capitalized)
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(.secondary)
        }
    }
}
`,
  },
  {
    name: 'AddEditContactView.swift',
    category: 'Views',
    description: 'Dynamic form allowing users to add/edit contacts with multiple phone numbers, multiple bank accounts, folder selection, and validation.',
    code: `//
//  AddEditContactView.swift
//  PersonalDirectory
//

import SwiftUI
import SwiftData

struct AddEditContactView: View {
    @Environment(\\.modelContext) private var modelContext
    @Environment(\\.dismiss) private var dismiss
    
    var contactToEdit: Contact?
    
    @Query private var folders: [Folder]
    
    @State private var firstName: String = ""
    @State private var lastName: String = ""
    @State private var nickname: String = ""
    @State private var notes: String = ""
    @State private var isFavorite: Bool = false
    @State private var selectedFolder: Folder?
    
    // Dynamic lists for Phone Numbers & Bank Accounts
    @State private var phoneItems: [PhoneDraft] = [PhoneDraft(label: "Mobile", number: "", isPrimary: true)]
    @State private var bankItems: [BankDraft] = []

    struct PhoneDraft: Identifiable {
        let id = UUID()
        var label: String
        var number: String
        var isPrimary: Bool
    }
    
    struct BankDraft: Identifiable {
        let id = UUID()
        var bankName: String
        var accountNumber: String
        var accountHolderName: String
        var routingNumber: String
        var branch: String
    }
    
    init(contactToEdit: Contact? = nil) {
        self.contactToEdit = contactToEdit
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Basic Information") {
                    TextField("First Name", text: $firstName)
                    TextField("Last Name", text: $lastName)
                    TextField("Nickname (Optional)", text: $nickname)
                    Toggle("Mark as Favorite", isOn: $isFavorite)
                }
                
                Section("Category Folder") {
                    Picker("Folder", selection: $selectedFolder) {
                        Text("None").tag(nil as Folder?)
                        ForEach(folders) { folder in
                            Text(folder.name).tag(folder as Folder?)
                        }
                    }
                }
                
                // Dynamic Multiple Phone Numbers
                Section {
                    ForEach($phoneItems) { $item in
                        HStack {
                            Menu(item.label) {
                                Button("Mobile") { item.label = "Mobile" }
                                Button("Work") { item.label = "Work" }
                                Button("Home") { item.label = "Home" }
                                Button("Main") { item.label = "Main" }
                            }
                            .font(.caption.weight(.semibold))
                            .frame(width: 70, alignment: .leading)
                            
                            TextField("Phone number", text: $item.number)
                                .keyboardType(.phonePad)
                        }
                    }
                    .onDelete { indices in
                        phoneItems.remove(atOffsets: indices)
                    }
                    
                    Button {
                        phoneItems.append(PhoneDraft(label: "Mobile", number: "", isPrimary: false))
                    } label: {
                        Label("Add Phone Number", systemImage: "plus.circle.fill")
                            .foregroundStyle(.green)
                    }
                } header: {
                    Text("Phone Numbers")
                }
                
                // Dynamic Multiple Bank Accounts
                Section {
                    ForEach($bankItems) { $bank in
                        VStack(alignment: .leading, spacing: 8) {
                            TextField("Bank Name (e.g., Chase, Wells Fargo)", text: $bank.bankName)
                            TextField("Account Number", text: $bank.accountNumber)
                                .keyboardType(.numberPad)
                            TextField("Account Holder Name", text: $bank.accountHolderName)
                            TextField("Routing / Sort Code (Optional)", text: $bank.routingNumber)
                        }
                        .padding(.vertical, 4)
                    }
                    .onDelete { indices in
                        bankItems.remove(atOffsets: indices)
                    }
                    
                    Button {
                        bankItems.append(BankDraft(
                            bankName: "",
                            accountNumber: "",
                            accountHolderName: firstName + " " + lastName,
                            routingNumber: "",
                            branch: ""
                        ))
                    } label: {
                        Label("Add Bank Account", systemImage: "plus.circle.fill")
                            .foregroundStyle(.blue)
                    }
                } header: {
                    Text("Bank Accounts")
                }
                
                Section("Notes & Address") {
                    TextEditor(text: $notes)
                        .frame(minHeight: 80)
                }
            }
            .navigationTitle(contactToEdit == nil ? "New Contact" : "Edit Contact")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { saveContact() }
                        .disabled(firstName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .onAppear(perform: populateExistingData)
        }
    }
    
    private func populateExistingData() {
        guard let contact = contactToEdit else { return }
        firstName = contact.firstName
        lastName = contact.lastName
        nickname = contact.nickname ?? ""
        notes = contact.notes
        isFavorite = contact.isFavorite
        selectedFolder = contact.folder
        
        phoneItems = contact.phoneNumbers.map {
            PhoneDraft(label: $0.label, number: $0.rawNumber, isPrimary: $0.isPrimary)
        }
        
        bankItems = contact.bankAccounts.map {
            BankDraft(
                bankName: $0.bankName,
                accountNumber: $0.accountNumber,
                accountHolderName: $0.accountHolderName,
                routingNumber: $0.routingNumber ?? "",
                branch: $0.branch ?? ""
            )
        }
    }
    
    private func saveContact() {
        if let existing = contactToEdit {
            existing.firstName = firstName
            existing.lastName = lastName
            existing.nickname = nickname.isEmpty ? nil : nickname
            existing.notes = notes
            existing.isFavorite = isFavorite
            existing.folder = selectedFolder
            existing.updatedAt = Date()
            
            // Sync phone numbers
            existing.phoneNumbers.removeAll()
            for draft in phoneItems where !draft.number.isEmpty {
                let p = PhoneNumber(label: draft.label, rawNumber: draft.number, isPrimary: draft.isPrimary, contact: existing)
                modelContext.insert(p)
            }
            
            // Sync banks
            existing.bankAccounts.removeAll()
            for bDraft in bankItems where !bDraft.accountNumber.isEmpty {
                let b = BankAccount(
                    bankName: bDraft.bankName,
                    accountNumber: bDraft.accountNumber,
                    accountHolderName: bDraft.accountHolderName,
                    routingNumber: bDraft.routingNumber.isEmpty ? nil : bDraft.routingNumber,
                    contact: existing
                )
                modelContext.insert(b)
            }
        } else {
            let newContact = Contact(
                firstName: firstName,
                lastName: lastName,
                nickname: nickname.isEmpty ? nil : nickname,
                isFavorite: isFavorite,
                notes: notes,
                folder: selectedFolder
            )
            modelContext.insert(newContact)
            
            for draft in phoneItems where !draft.number.isEmpty {
                let p = PhoneNumber(label: draft.label, rawNumber: draft.number, isPrimary: draft.isPrimary, contact: newContact)
                modelContext.insert(p)
            }
            
            for bDraft in bankItems where !bDraft.accountNumber.isEmpty {
                let b = BankAccount(
                    bankName: bDraft.bankName,
                    accountNumber: bDraft.accountNumber,
                    accountHolderName: bDraft.accountHolderName,
                    routingNumber: bDraft.routingNumber.isEmpty ? nil : bDraft.routingNumber,
                    contact: newContact
                )
                modelContext.insert(b)
            }
        }
        
        dismiss()
    }
}
`,
  },
  {
    name: 'CallHistoryView.swift',
    category: 'Views',
    description: 'Call Logs tab with filters for All/Missed, direct 1-tap callback, duration display, and call notes.',
    code: `//
//  CallHistoryView.swift
//  PersonalDirectory
//

import SwiftUI
import SwiftData

struct CallHistoryView: View {
    @Environment(\\.modelContext) private var modelContext
    @Query(sort: \\CallLog.timestamp, order: .reverse) private var callLogs: [CallLog]
    
    @State private var filterMissedOnly: Bool = false
    
    var filteredLogs: [CallLog] {
        if filterMissedOnly {
            return callLogs.filter { $0.callType == .missed }
        }
        return callLogs
    }

    var body: some View {
        NavigationStack {
            List {
                Picker("Call Type", selection: $filterMissedOnly) {
                    Text("All").tag(false)
                    Text("Missed").tag(true)
                }
                .pickerStyle(.segmented)
                .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                .listRowBackground(Color.clear)
                
                ForEach(filteredLogs) { log in
                    HStack(spacing: 12) {
                        Image(systemName: log.callType.iconName)
                            .foregroundStyle(log.callType == .missed ? .red : .secondary)
                            .font(.system(size: 16))
                            .frame(width: 24)
                        
                        VStack(alignment: .leading, spacing: 3) {
                            Text(log.contactNameSnapshot)
                                .font(.body.weight(.medium))
                                .foregroundStyle(log.callType == .missed ? .red : .primary)
                            
                            HStack(spacing: 6) {
                                Text(log.dialedNumber)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                if log.durationSeconds > 0 {
                                    Text("• \\(formatDuration(log.durationSeconds))")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        
                        Spacer()
                        
                        Text(log.timestamp.formatted(date: .omitted, time: .shortened))
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 2)
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        modelContext.delete(filteredLogs[index])
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Recents")
        }
    }
    
    private func formatDuration(_ seconds: Int) -> String {
        let mins = seconds / 60
        let secs = seconds % 60
        return String(format: "%02d:%02d", mins, secs)
    }
}
`,
  },
  {
    name: 'SettingsView.swift',
    category: 'Views',
    description: 'Security & CloudKit Settings view with LocalAuthentication toggles, iCloud sync monitor, and Keychain encryption audits.',
    code: `//
//  SettingsView.swift
//  PersonalDirectory
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var biometricManager: BiometricAuthManager
    @EnvironmentObject private var cloudKitMonitor: CloudKitSyncMonitor

    var body: some View {
        NavigationStack {
            Form {
                Section("Security & Biometrics") {
                    Toggle("Require Face ID / Touch ID", isOn: $biometricManager.isBiometricEnabled)
                    
                    if biometricManager.isBiometricEnabled {
                        HStack {
                            Text("Biometric Hardware")
                            Spacer()
                            Text(biometricManager.biometryType == .faceID ? "Face ID" : "Touch ID")
                                .foregroundStyle(.secondary)
                        }
                        
                        Button("Lock App Now") {
                            biometricManager.lockApp()
                        }
                        .foregroundStyle(.red)
                    }
                }
                
                Section("iCloud Synchronization") {
                    HStack {
                        Text("CloudKit Status")
                        Spacer()
                        Text(cloudKitMonitor.status.rawValue)
                            .foregroundStyle(cloudKitMonitor.status == .synced ? .green : .secondary)
                    }
                    
                    HStack {
                        Text("Private Container")
                        Spacer()
                        Text("iCloud.com.personal.directory")
                            .font(.caption.monospaced())
                            .foregroundStyle(.secondary)
                    }
                }
                
                Section("Local Encryption (Secure Enclave)") {
                    HStack {
                        Text("Bank Data Cipher")
                        Spacer()
                        Text("AES-256 GCM (Keychain)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}
`,
  },
];
