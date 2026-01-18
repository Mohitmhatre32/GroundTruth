// Simple ID generator to avoid external dependencies
const generateId = () => 'user_' + Math.random().toString(36).substr(2, 9);

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

const USERS_STORAGE_KEY = 'groundtruth_users';

export const localAuth = {
    getUsers: (): User[] => {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        return users ? JSON.parse(users) : [];
    },

    saveUser: (user: User) => {
        const users = localAuth.getUsers();
        users.push(user);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    },

    register: (email: string, password: string): User => {
        // In a real app, password should be hashed. For this mock, we just check email uniqueness.
        const users = localAuth.getUsers();
        if (users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const newUser: User = {
            id: generateId(),
            email,
            name: email.split('@')[0], // Default name from email
            role: 'Official' // Default role
        };

        // associating password with user "mock" style - effectively just storing it
        // BUT wait, the prompt asks to "take email and password as credential"
        // Since we are storing "credentials in local in json file", we should probably store the password too 
        // effectively simulating a DB.

        // Let's modify the storage structure to include password validation.
        // We will store a separate object for auth if we want to be clean, OR just add password to the User object (insecure but fits "mock" requirement)
        // given "no complex api no backend", I'll just store the user with a password field in the local storage array
        // but verify against it.

        // Redefining internal type for storage
        const userToStore = {
            ...newUser,
            password // Plain text as per "mock" simplicity, normally this is a sin.
        };

        const currentStorage = localStorage.getItem(USERS_STORAGE_KEY);
        const currentUsers = currentStorage ? JSON.parse(currentStorage) : [];
        currentUsers.push(userToStore);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(currentUsers));

        return newUser;
    },

    login: (email: string, password: string): User => {
        const users = localStorage.getItem(USERS_STORAGE_KEY);
        const parsedUsers = users ? JSON.parse(users) : [];

        const user = parsedUsers.find((u: any) => u.email === email && u.password === password);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Return user without password
        const { password: _, ...userSafe } = user;
        return userSafe;
    }
};
