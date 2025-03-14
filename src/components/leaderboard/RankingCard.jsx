import { useAuth } from "../../context/AuthContext";
import { formatAddress } from "../../utils/format";
import WalletAvatar from "../../components/wallet/WalletAvatar";

const RankingCard = ({scenario, leaderboardData}) => {
  const { walletAddress } = useAuth();

  console.log(leaderboardData)
  console.log(walletAddress)
  let currentUser = leaderboardData.find(x => x.walletAddress === walletAddress);
  if(!currentUser){
    currentUser = {
      rank: '-',
      totalBalance: 0,
      walletAddress
    }
  }

  const topTen = scenario.id === 'overall' ? leaderboardData : leaderboardData?.slice(0, 10);

  // 사용자가 top 10에 있는지 확인
  const isUserIntopTen = currentUser?.rank <= 5;

  // 사용자가 top 10에 없는 경우에만 사용자 정보 표시
  const shouldShowCurrentUser = !isUserIntopTen;

  return (
    <div className="table-container">
      <h4>{scenario.name}</h4>
      <table className="cyber-table">
        <thead>
          <tr>
            <th>RANK</th>
            <th>USER</th>
            <th>BALANCE</th>
          </tr>
        </thead>
        <tbody>
          {/* 상위 10위 표시 */}
          {topTen.map((entry, index) => {
            const isCurrentUser = entry.walletAddress === currentUser?.walletAddress;
            return (
              <tr
                key={index}
                className={isCurrentUser ? "current-user-row" : ""}
              >
                <td className="rank-cell">
                  {entry.rank <= 3 ? (
                    <div className={`rank-badge rank-${entry.rank}`}>
                      {entry.rank}
                    </div>
                  ) : (
                    <span>{entry.rank}</span>
                  )}
                </td>
                <td className="user-cell">
                  {isCurrentUser && <h6 className="you-badge">YOU</h6>}
                  <WalletAvatar address={entry.walletAddress} size={16} animation={true} />
                  <span className="current-user">
                    {formatAddress(entry.walletAddress)}
                  </span>
                </td>
                <td className="balance-cell">${entry.totalBalance || 0}</td>
              </tr>
            );
          })}

          {shouldShowCurrentUser && (
            <>
              {/* 상위 5위와 현재 사용자 순위 사이에 구분선 추가 */}
              <tr className="separator-row">
                <td colSpan="3" className="separator-cell">
                  <div className="separator">
                    <span>•••</span>
                  </div>
                </td>
              </tr>

              {/* 현재 사용자 순위 표시 */}
              <tr className="current-user-row">
                <td className="rank-cell">
                  <span>{currentUser?.rank}</span>
                </td>
                <td className="user-cell">
                  <WalletAvatar address={currentUser?.walletAddress} size={16} animation={true} />
                  <h6 className="you-badge">YOU</h6>
                  <span className="current-user">
                    {formatAddress(currentUser?.walletAddress)}
                  </span>
                </td>
                <td className="balance-cell">${currentUser?.totalBalance}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default RankingCard;
