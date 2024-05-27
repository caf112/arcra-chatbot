import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
import { ConversationProvider } from "./contexts/ConversationContext";
import AuthWrapper from "./components/AuthWrapper"; // 認証チェック用のクライアントコンポーネントをインポート

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "生成AI体験研修 ",
  description: "生成AIの体験用チャットbot",
  icons: {
    icon: "/ARCRA.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="jp">
      <ConversationProvider>
        <body className={inter.className}>
          <AuthWrapper> {/* ここで認証チェックを行う */}
            {assistantId ? children : <Warnings />}
            <img className="logo" src="/ARCRA.svg" alt="OpenAI Logo" />
          </AuthWrapper>
        </body>
      </ConversationProvider>
    </html>
  );
}
