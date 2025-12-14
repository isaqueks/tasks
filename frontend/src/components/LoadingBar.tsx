interface LoadingBarProps {
  isLoading: boolean;
}

export const LoadingBar = ({ isLoading }: LoadingBarProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div 
        className="h-full bg-primary-600 transition-all duration-300"
        style={{
          width: '100%',
          animation: 'loading 1.5s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

