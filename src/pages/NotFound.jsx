
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-medium text-gray-600 mb-8">
        Página não encontrada
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
}
