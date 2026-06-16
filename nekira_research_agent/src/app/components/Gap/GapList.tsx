import { Gap } from '@/graph/state';
import { GapCard } from "@/components/Gap/GapCard"

interface GapListProps {
  gaps: Gap[],
  onChange: (updatedGaps: Gap[]) => void;
}

export function GapList({ gaps, onChange }: GapListProps) {
  // 修改指定的Gap
  const handleUpdateGap = (index: number, updated: Gap) => {
    const newGaps = [...gaps];
    newGaps[index] = updated;
    onChange(newGaps);
  };

  // 删除指定的Gap
  const handleDeleteGap = (index: number) => {
    const newGaps = gaps.filter((_, i) => i !== index);
    onChange(newGaps);
  };

  // 添加新的Gap
  const handleAddGap = () => {
    const newGaps = [...gaps, { question: "", priority: "medium" as const }];
    onChange(newGaps);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* 渲染卡片列表 */}
      {gaps.length === 0 ? (
        <div style={{
          padding: "20px",
          textAlign: "center",
          color: "var(--color-text-tertiary)",
          fontSize: "12px",
          background: "var(--color-background-secondary, #F1EFE8)",
          borderRadius: "var(--border-radius-md, 8px)"
        }}>
          暂无知识缺口，可以点击下方手动添加。
        </div>
      ) : (
        gaps.map((gap, idx) => (
          <GapCard
            key={idx}
            gap={gap}
            index={idx}
            onUpdate={handleUpdateGap}
            onDelete={handleDeleteGap}
          />
        ))
      )}

      {/* 手动追加自定义调研方向 */}
      <button
        type="button"
        onClick={handleAddGap}
        style={{
          alignSelf: "flex-start",
          background: "transparent",
          border: "0.5px dashed var(--color-border-secondary, rgba(0,0,0,0.3))",
          color: "var(--color-text-secondary, #5F5E5A)",
          padding: "6px 12px",
          borderRadius: "var(--border-radius-md, 8px)",
          fontSize: "12px",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        + 新增自定义缺口问题 (Add Gap)
      </button>
    </div>
  );
}
