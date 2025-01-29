'use client';
import { FC, ReactElement, useState } from 'react';
import { renderButtons, renderCreateButton, renderRefreshButtons, renderTableAndPagination } from './HomeComponent';
import { IMonitorState } from '@/interfaces/monitor.interface';
import { useHome } from '../hooks/useHome';
import MonitorSelectionModal from '@/components/MonitorSelectionModel';
import HomeSkeleton from './HomeSkeleton';

const Home: FC = (): ReactElement => {
  const {
    monitorState,
    monitors,
    limit,
    isRefreshed,
    monitorsRef,
    autoMonitorsRef,
    view,
    loading,
    setView,
    setMonitors,
    setMonitorState,
    refreshMonitors,
    enableAutoRefresh,
    closeUptimeModal,
    openModal,
    updateLimit
  } = useHome();
  return (
    <>
      {(monitorState.showModal || openModal) && (
            <MonitorSelectionModal onClose={() => {
                setMonitorState({...monitorState, showModal: false});
                closeUptimeModal();
            }} />
      )}
      <div className="m-auto px-6 h-screen relative min-h-screen xl:container md:px-12 lg:px-6 flex-1">
        {
            loading && <HomeSkeleton />
        }
        <>
        {
            !loading && monitors.length > 0 ? (
            <>{
                renderButtons(monitors, monitorState, setMonitorState)
            }
            {
                renderRefreshButtons(
                    view, 
                    isRefreshed!, 
                    monitorsRef.current, 
                    monitors, 
                    setView, 
                    setMonitors, 
                    () => refreshMonitors(), 
                    () => enableAutoRefresh()
                )
            }
            {
                renderTableAndPagination(
                    view, 
                    limit, 
                    monitorState.autoRefreshLoading, 
                    monitors,
                    updateLimit
                )
            }</>
            ) : (
                <>
                    {
                        !loading && !monitors.length && (
                            <>
                                {renderCreateButton(
                                    monitorState, setMonitorState
                                )}
                            </>
                        )
                    }
                </>
            )
        }
        </>
        
      </div>
    </>
  )
}

export default Home;