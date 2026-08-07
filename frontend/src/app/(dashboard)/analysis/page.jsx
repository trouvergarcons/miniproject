
export default function AnalysisPage() {
  return (
    <div className="text-white h-screen overflow-hidden">

      {/* Title */}
      <div className="px-6 pt-6 mb-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text tracking-wide drop-shadow-lg">
          Analysis Dashboard
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Fake News Detection & Insights Overview
        </p>
      </div>

      {/* Dashboard */}
      <div className="w-full h-[70vh] px-6 pb-4 overflow-hidden">
        <div className="bg-[#0b1120] rounded-xl h-full overflow-hidden shadow-lg">
          <iframe
            src="https://lookerstudio.google.com/embed/reporting/b4d12f87-16e5-4afa-9b13-f588682af11b/page/1kxtF"
            className="w-full h-full border-none"
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          ></iframe>
        </div>
      </div>

      {/* Insights */}
      <div className="px-6 pb-4">
        <div className="bg-[#111827] p-4 rounded-xl">
          <h2 className="text-lg mb-2">Key Insights</h2>
          <ul className="text-sm text-gray-400 list-disc ml-5">
            <li>Majority of false claims belong to political category</li>
            <li>Peak misinformation observed during weekends</li>
            <li>AI verification accuracy is around 85%</li>
          </ul>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-3">
          *Live dashboard integrated using Looker Studio.
        </p>
      </div>

    </div>
  );
}

