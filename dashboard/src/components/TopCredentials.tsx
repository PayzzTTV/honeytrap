interface Credential {
  username: string;
  password: string;
  count: number;
}

export default function TopCredentials({ credentials }: { credentials: Credential[] }) {
  return (
    <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-lg">
      <h3 className="text-white font-semibold mb-4">Top Credentials (SSH)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-800">
              <th className="pb-2">Username</th>
              <th className="pb-2">Password</th>
              <th className="pb-2 text-right">Attempts</th>
              <th className="pb-2 text-right">%</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 text-sm">
            {credentials.map((cred, i) => {
              const total = credentials.reduce((acc, curr) => acc + curr.count, 0);
              const percentage = total > 0 ? ((cred.count / total) * 100).toFixed(1) : 0;
              return (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                  <td className="py-2 font-mono text-cyan-400">{cred.username}</td>
                  <td className="py-2 font-mono">{cred.password}</td>
                  <td className="py-2 text-right text-red-400 font-bold">{cred.count}</td>
                  <td className="py-2 text-right text-gray-500">{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
