'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Memo, MEMO_CATEGORIES } from '@/types/memo'

// MDEditor.Markdown을 dynamic import로 로드 (SSR 이슈 방지)
const MDViewer = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
)

interface MemoViewerProps {
  memo: Memo | null
  isOpen: boolean
  onClose: () => void
  onEdit: (memo: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoViewer({
  memo,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: MemoViewerProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // 모달이 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // 모달이 닫힐 때 스크롤 복원
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // 모달이 열려있지 않거나 메모가 없으면 렌더링하지 않음
  if (!isOpen || !memo) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      personal: 'bg-blue-100 text-blue-800',
      work: 'bg-green-100 text-green-800',
      study: 'bg-purple-100 text-purple-800',
      idea: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const handleEdit = () => {
    onEdit(memo)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl mx-auto">
          {/* 모달 콘텐츠 */}
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(memo.category)}`}
                  >
                    {MEMO_CATEGORIES[memo.category as keyof typeof MEMO_CATEGORIES] ||
                      memo.category}
                  </span>
                  <div className="text-sm text-gray-500">
                    <div>작성: {formatDate(memo.createdAt)}</div>
                    {memo.updatedAt !== memo.createdAt && (
                      <div>수정: {formatDate(memo.updatedAt)}</div>
                    )}
                  </div>
                </div>

                {/* 닫기 버튼 */}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="닫기 (ESC)"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* 본문 */}
            <div className="px-6 py-6">
              {/* 제목 */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {memo.title}
              </h1>

              {/* 내용 - 마크다운 렌더링 */}
              <div className="prose max-w-none mb-6">
                <MDViewer 
                  source={memo.content} 
                  data-color-mode="light"
                  style={{ backgroundColor: 'transparent' }}
                />
              </div>

              {/* 태그 */}
              {memo.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">태그</h3>
                  <div className="flex gap-2 flex-wrap">
                    {memo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  편집
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}