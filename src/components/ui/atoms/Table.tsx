import { LoadingOutlined } from '@ant-design/icons'
import { Table as AntTable, Spin } from 'antd'
import { TableProps } from 'antd/lib/table'
import InfiniteScroll from 'react-infinite-scroll-component'

interface PaginationProps {
  total?: number
  current?: number
  pageSize?: number
  hasNextPage?: boolean
}

interface Props extends TableProps<any> {
  pagination?: PaginationProps
  loading?: boolean
  data: any[] // Assuming the type of your data
  columns: any[] // Assuming the type of your columns
  refetch?: (paginate?: boolean, reset?: boolean) => Promise<void>
  setParams?: (params: any) => void
  params?: any
  getFilters?: (filters: any) => any
  fixedScroll?: boolean
  defaultSortingKey?: string
  $clickable?: boolean
  showFooter?: boolean
}

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

const Table: React.FC<Props> = ({
  loading,
  data,
  columns,
  refetch,
  size,
  pagination: { total, hasNextPage } = { hasNextPage: false },
  setParams,
  params,
  getFilters = () => {},
  fixedScroll,
  defaultSortingKey,
  showFooter,
  ...tableProps
}: Props) => {
  const getSorter = (sorter: any) => {
    const sortBy = sorter && sorter.order ? sorter.columnKey : defaultSortingKey ?? 'id'
    const sortOrder = sorter.order === 'ascend' ? SortOrder.Asc : SortOrder.Desc

    return {
      sortBy,
      sortOrder,
    }
  }

  const onChange: TableProps<any>['onChange'] = (_, filters, sorter, __) => {
    if (setParams) setParams({ ...params, ...getFilters(filters), ...getSorter(sorter) })
  }

  const Footer = () => (
    <div
      style={{
        opacity: !loading ? 1 : 0.4,
        display: 'flex',
        padding: '5px 15px',
        borderTop: '1px solid #dedede',
        right: '0',
        position: 'fixed',
        bottom: 0,
        width: `calc(100% - ${250}px)`,
        background: 'white',
      }}>
      Showing {data?.length} of {total} results
    </div>
  )

  const footerProps = showFooter && data?.length > 15 ? { footer: () => <Footer /> } : {}

  const handleNext = () => {
    console.log('🔄 InfiniteScroll next called, hasNextPage:', hasNextPage)
    if (refetch) {
      refetch(true, false)
    }
  }

  return (
    <InfiniteScroll
      scrollableTarget="main-content"
      style={{ userSelect: 'none' }}
      next={handleNext}
      loader={
        <div
          style={{
            height: '50px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Spin size="default" indicator={<LoadingOutlined size={40} />} spinning />
        </div>
      }
      hasMore={hasNextPage ?? false}
      dataLength={data?.length ?? 0}
      endMessage={
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>No more items to load</p>
        </div>
      }>
      <AntTable
        $clickable={!!tableProps.onRow}
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={false}
        dataSource={data}
        columns={columns}
        onChange={onChange}
        {...footerProps}
        {...tableProps}
      />
    </InfiniteScroll>
  )
}

export default Table
