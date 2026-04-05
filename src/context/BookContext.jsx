import { createContext, useContext, useReducer, useEffect } from 'react';

const BookContext = createContext();

const initialState = {
  books: JSON.parse(localStorage.getItem('bm_books') || '[]'),
  isAdmin: JSON.parse(localStorage.getItem('bm_admin') || 'false'),
  profile: JSON.parse(localStorage.getItem('bm_profile') || 'null') || {
    name: 'Book Lover',
    bio: '',
    email: '',
    avatarUrl: '',
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_BOOK':
      return { ...state, books: [action.payload, ...state.books] };
    case 'UPDATE_BOOK':
      return {
        ...state,
        books: state.books.map(b => b.id === action.payload.id ? action.payload : b),
      };
    case 'DELETE_BOOK':
      return { ...state, books: state.books.filter(b => b.id !== action.payload) };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_ADMIN':
      return { ...state, isAdmin: action.payload };
    default:
      return state;
  }
}

export function BookProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    localStorage.setItem('bm_books', JSON.stringify(state.books));
  }, [state.books]);

  useEffect(() => {
    localStorage.setItem('bm_profile', JSON.stringify(state.profile));
  }, [state.profile]);

  useEffect(() => {
    localStorage.setItem('bm_admin', JSON.stringify(state.isAdmin));
  }, [state.isAdmin]);

  const addBook    = (book)    => dispatch({ type: 'ADD_BOOK',    payload: book });
  const updateBook = (book)    => dispatch({ type: 'UPDATE_BOOK', payload: book });
  const deleteBook = (id)      => dispatch({ type: 'DELETE_BOOK', payload: id });
  const setProfile = (profile) => dispatch({ type: 'SET_PROFILE', payload: profile });
  const setAdmin   = (isAdmin) => dispatch({ type: 'SET_ADMIN',   payload: isAdmin });

  const login = (password) => {
    // For now, a simple password. In production, this would be a real auth check.
    if (password === 'admin123') {
      setAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setAdmin(false);

  return (
    <BookContext.Provider value={{ 
      ...state, 
      addBook, 
      updateBook, 
      deleteBook, 
      setProfile, 
      setAdmin,
      login,
      logout 
    }}>
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  return useContext(BookContext);
}
