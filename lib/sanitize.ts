import sanitizeHtml from 'sanitize-html'

// HTML 살균 옵션 - 안전한 태그와 속성만 허용
const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    // 텍스트 포맷팅
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'b', 'i', 'strong', 'em', 'u', 's', 'strike',
    'blockquote', 'pre', 'code',
    // 리스트
    'ul', 'ol', 'li',
    // 테이블
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    // 링크 및 이미지
    'a', 'img',
    // 구조
    'div', 'span', 'section', 'article',
  ],
  allowedAttributes: {
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'th': ['colspan', 'rowspan'],
    'td': ['colspan', 'rowspan'],
    '*': ['class', 'id'], // 모든 태그에 class, id 허용
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  // 링크에 자동으로 rel="noopener noreferrer" 추가
  transformTags: {
    'a': (tagName, attribs) => {
      return {
        tagName,
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
          target: attribs.target || '_blank',
        },
      }
    },
  },
  // 스크립트, 이벤트 핸들러 등 위험한 콘텐츠 제거
  disallowedTagsMode: 'discard',
}

/**
 * HTML 콘텐츠를 살균하여 XSS 공격을 방지합니다.
 *
 * @param dirty - 살균할 HTML 문자열
 * @param options - 커스텀 옵션 (선택사항)
 * @returns 살균된 HTML 문자열
 */
export function sanitizeContent(
  dirty: string,
  options?: sanitizeHtml.IOptions
): string {
  return sanitizeHtml(dirty, options || defaultOptions)
}

/**
 * 텍스트 전용 살균 - 모든 HTML 태그 제거
 *
 * @param dirty - 살균할 문자열
 * @returns 텍스트만 남은 문자열
 */
export function sanitizeText(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  })
}
