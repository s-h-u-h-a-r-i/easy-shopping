import asyncio
from collections.abc import Awaitable, Callable, Generator
from typing import Any, List, Never, Optional, Tuple, TypeIs, overload

__all__ = ("Ok", "Err", "Die", "Exit", "Effect")

type Thunk[T] = Callable[[], T]


# region Exit types


class Ok[A]:
    def __init__(self, value: A) -> None:
        self._value = value

    @property
    def value(self) -> A:
        return self._value

    def __repr__(self) -> str:
        return f"{Ok.__name__}(value={self._value!r})"

    def __str__(self) -> str:
        return f"{Ok.__name__}({self._value})"


class Err[E]:
    def __init__(self, error: E) -> None:
        self._error = error

    @property
    def error(self) -> E:
        return self._error

    def __repr__(self) -> str:
        return f"{Err.__name__}(error={self._error!r})"

    def __str__(self) -> str:
        return f"Err({self._error})"


class Die:
    def __init__(
        self, defect: Exception, *, suppressed: Optional[Ok[Any] | Err[Any]] = None
    ) -> None:
        self._defect = defect
        self._suppressed = suppressed

    @property
    def defect(self) -> Exception:
        return self._defect

    @property
    def suppressed(self) -> Optional[Ok[Any] | Err[Any]]:
        return self._suppressed

    def __repr__(self) -> str:
        parts = [f"defect={self._defect!r}"]
        if self._suppressed is not None:
            parts.append(f"suppressed={self._suppressed!r}")
        return f"{Die.__name__}({', '.join(parts)})"

    def __str__(self) -> str:
        d = self._defect
        s = f"{type(d).__name__}: {d}"
        if self._suppressed is not None:
            return f"{Die.__name__}({s}, suppressed={self._suppressed})"
        return f"{Die.__name__}({s})"


type Exit[A, E] = Ok[A] | Err[E] | Die

# endregion Exit types


class Effect[A, E]:
    __slots__ = ("_thunk",)

    def __init__(self, inner: Thunk[Awaitable[Exit[A, E]]]) -> None:
        async def guarded() -> Exit[A, E]:
            try:
                return await inner()
            except asyncio.CancelledError:
                raise
            except Exception as defect:
                return Die(defect)

        self._thunk = guarded

    def __await__(self) -> Generator[Any, None, Exit[A, E]]:
        return self._thunk().__await__()

    @staticmethod
    def succeed[T](value: T) -> Effect[T, Never]:
        async def inner() -> Exit[T, Never]:
            return Ok(value)

        return Effect(inner)

    @staticmethod
    def fail[T](error: T) -> Effect[Never, T]:
        async def inner() -> Exit[Never, T]:
            return Err(error)

        return Effect(inner)

    @staticmethod
    def die(defect: Exception) -> Effect[Never, Never]:
        async def inner() -> Exit[Never, Never]:
            return Die(defect)

        return Effect(inner)

    @staticmethod
    def from_async[T, F](f: Thunk[Awaitable[T]], map_exc: Callable[[Exception], F]):
        async def inner() -> Exit[T, F]:
            try:
                value = await f()
                return Ok(value)
            except Exception as ex:
                error = map_exc(ex)
                return Err(error)

        return Effect(inner)

    # region Effect — par overloads

    @overload
    @staticmethod
    def par[A1, A2, E1, E2](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
    ) -> Effect[Tuple[A1, A2], E1 | E2]: ...
    @overload
    @staticmethod
    def par[A1, A2, A3, E1, E2, E3](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
    ) -> Effect[Tuple[A1, A2, A3], E1 | E2 | E3]: ...
    @overload
    @staticmethod
    def par[A1, A2, A3, A4, E1, E2, E3, E4](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
    ) -> Effect[Tuple[A1, A2, A3, A4], E1 | E2 | E3 | E4]: ...
    @overload
    @staticmethod
    def par[A1, A2, A3, A4, A5, E1, E2, E3, E4, E5](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
    ) -> Effect[Tuple[A1, A2, A3, A4, A5], E1 | E2 | E3 | E4 | E5]: ...
    @overload
    @staticmethod
    def par[A1, A2, A3, A4, A5, A6, E1, E2, E3, E4, E5, E6](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
    ) -> Effect[Tuple[A1, A2, A3, A4, A5, A6], E1 | E2 | E3 | E4 | E5 | E6]: ...
    @overload
    @staticmethod
    def par[A1, A2, A3, A4, A5, A6, A7, E1, E2, E3, E4, E5, E6, E7](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
        e7: Effect[A7, E7],
    ) -> Effect[
        Tuple[A1, A2, A3, A4, A5, A6, A7], E1 | E2 | E3 | E4 | E5 | E6 | E7
    ]: ...
    @overload
    @staticmethod
    def par[A1, A2, A3, A4, A5, A6, A7, A8, E1, E2, E3, E4, E5, E6, E7, E8](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
        e7: Effect[A7, E7],
        e8: Effect[A8, E8],
    ) -> Effect[
        Tuple[A1, A2, A3, A4, A5, A6, A7, A8], E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8
    ]: ...
    @overload
    @staticmethod
    def par[A1, A2, A3, A4, A5, A6, A7, A8, A9, E1, E2, E3, E4, E5, E6, E7, E8, E9](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
        e7: Effect[A7, E7],
        e8: Effect[A8, E8],
        e9: Effect[A9, E9],
    ) -> Effect[
        Tuple[A1, A2, A3, A4, A5, A6, A7, A8, A9],
        E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9,
    ]: ...
    @overload
    @staticmethod
    def par[
        A1,
        A2,
        A3,
        A4,
        A5,
        A6,
        A7,
        A8,
        A9,
        A10,
        E1,
        E2,
        E3,
        E4,
        E5,
        E6,
        E7,
        E8,
        E9,
        E10,
    ](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
        e7: Effect[A7, E7],
        e8: Effect[A8, E8],
        e9: Effect[A9, E9],
        e10: Effect[A10, E10],
    ) -> Effect[
        Tuple[A1, A2, A3, A4, A5, A6, A7, A8, A9, A10],
        E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10,
    ]: ...

    # endregion Effect — par overloads

    @staticmethod  # type: ignore[misc]
    def par(*effects: Effect[Any, Any]) -> Effect[Tuple[Any, ...], Any]:
        async def inner() -> Exit[Tuple[Any, ...], Any]:
            exits = await asyncio.gather(*(e._thunk() for e in effects))
            out: List[Any] = []
            for e in exits:
                if not _is_ok(e):
                    return e
                out.append(e.value)
            return Ok(value=tuple(out))

        return Effect(inner)

    # region Effect — gather_exits overloads

    @overload
    @staticmethod
    def gather_exits[A1, E1, A2, E2](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
    ) -> Effect[
        Tuple[
            Exit[A1, E1],
            Exit[A2, E2],
        ],
        Never,
    ]: ...
    @overload
    @staticmethod
    def gather_exits[A1, E1, A2, E2, A3, E3](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
    ) -> Effect[
        Tuple[
            Exit[A1, E1],
            Exit[A2, E2],
            Exit[A3, E3],
        ],
        Never,
    ]: ...
    @overload
    @staticmethod
    def gather_exits[A1, E1, A2, E2, A3, E3, A4, E4](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
    ) -> Effect[
        Tuple[
            Exit[A1, E1],
            Exit[A2, E2],
            Exit[A3, E3],
            Exit[A4, E4],
        ],
        Never,
    ]: ...
    @overload
    @staticmethod
    def gather_exits[A1, E1, A2, E2, A3, E3, A4, E4, A5, E5](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
    ) -> Effect[
        Tuple[
            Exit[A1, E1],
            Exit[A2, E2],
            Exit[A3, E3],
            Exit[A4, E4],
            Exit[A5, E5],
        ],
        Never,
    ]: ...
    @overload
    @staticmethod
    def gather_exits[A1, E1, A2, E2, A3, E3, A4, E4, A5, E5, A6, E6](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
    ) -> Effect[
        Tuple[
            Exit[A1, E1],
            Exit[A2, E2],
            Exit[A3, E3],
            Exit[A4, E4],
            Exit[A5, E5],
            Exit[A6, E6],
        ],
        Never,
    ]: ...
    @overload
    @staticmethod
    def gather_exits[A1, E1, A2, E2, A3, E3, A4, E4, A5, E5, A6, E6, A7, E7](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
        e7: Effect[A7, E7],
    ) -> Effect[
        Tuple[
            Exit[A1, E1],
            Exit[A2, E2],
            Exit[A3, E3],
            Exit[A4, E4],
            Exit[A5, E5],
            Exit[A6, E6],
            Exit[A7, E7],
        ],
        Never,
    ]: ...
    @overload
    @staticmethod
    def gather_exits[A1, E1, A2, E2, A3, E3, A4, E4, A5, E5, A6, E6, A7, E7, A8, E8](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
        e7: Effect[A7, E7],
        e8: Effect[A8, E8],
    ) -> Effect[
        Tuple[
            Exit[A1, E1],
            Exit[A2, E2],
            Exit[A3, E3],
            Exit[A4, E4],
            Exit[A5, E5],
            Exit[A6, E6],
            Exit[A7, E7],
            Exit[A8, E8],
        ],
        Never,
    ]: ...
    @overload
    @staticmethod
    def gather_exits[
        A1,
        E1,
        A2,
        E2,
        A3,
        E3,
        A4,
        E4,
        A5,
        E5,
        A6,
        E6,
        A7,
        E7,
        A8,
        E8,
        A9,
        E9,
    ](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
        e7: Effect[A7, E7],
        e8: Effect[A8, E8],
        e9: Effect[A9, E9],
    ) -> Effect[
        Tuple[
            Exit[A1, E1],
            Exit[A2, E2],
            Exit[A3, E3],
            Exit[A4, E4],
            Exit[A5, E5],
            Exit[A6, E6],
            Exit[A7, E7],
            Exit[A8, E8],
            Exit[A9, E9],
        ],
        Never,
    ]: ...
    @overload
    @staticmethod
    def gather_exits[
        A1,
        E1,
        A2,
        E2,
        A3,
        E3,
        A4,
        E4,
        A5,
        E5,
        A6,
        E6,
        A7,
        E7,
        A8,
        E8,
        A9,
        E9,
        A10,
        E10,
    ](
        e1: Effect[A1, E1],
        e2: Effect[A2, E2],
        e3: Effect[A3, E3],
        e4: Effect[A4, E4],
        e5: Effect[A5, E5],
        e6: Effect[A6, E6],
        e7: Effect[A7, E7],
        e8: Effect[A8, E8],
        e9: Effect[A9, E9],
        e10: Effect[A10, E10],
    ) -> Effect[
        Tuple[
            Exit[A1, E1],
            Exit[A2, E2],
            Exit[A3, E3],
            Exit[A4, E4],
            Exit[A5, E5],
            Exit[A6, E6],
            Exit[A7, E7],
            Exit[A8, E8],
            Exit[A9, E9],
            Exit[A10, E10],
        ],
        Never,
    ]: ...

    # endregion Effect — gather_exits overloads

    @staticmethod  # type: ignore[misc]
    def gather_exits(
        *effects: Effect[Any, Any]
    ) -> Effect[Tuple[Exit[Any, Any], ...], Never]:
        async def inner() -> Exit[Tuple[Exit[Any, Any], ...], Never]:
            exits = await asyncio.gather(*(e._thunk() for e in effects))
            return Ok(value=tuple(exits))

        return Effect(inner)

    # region Effect — combinators

    def map[A2](self, f: Callable[[A], A2]) -> Effect[A2, E]:
        async def inner() -> Exit[A2, E]:
            exit = await self
            if not _is_ok(exit):
                return exit
            return _protect_sync(lambda: f(exit.value))

        return Effect(inner)

    def flat_map[A2, E2](self, f: Callable[[A], Effect[A2, E2]]) -> Effect[A2, E | E2]:
        async def inner() -> Exit[A2, E | E2]:
            exit = await self
            if not _is_ok(exit):
                return exit
            protected = await _protect_async(lambda: f(exit.value))
            if _is_ok(protected):
                return protected.value
            return protected

        return Effect(inner)

    def tap[A2, E2](self, f: Callable[[A], Effect[A2, E2]]) -> Effect[A, E | E2]:
        async def inner() -> Exit[A, E | E2]:
            exit = await self
            if not _is_ok(exit):
                return exit
            side = await _protect_async(lambda: f(exit.value))
            if not _is_ok(side):
                return side
            side_exit = side.value
            if not _is_ok(side_exit):
                return side_exit
            return exit

        return Effect(inner)

    def map_error[E2](self, f: Callable[[E], E2]) -> Effect[A, E2]:
        async def inner() -> Exit[A, E2]:
            exit = await self
            if not _is_err(exit):
                return exit
            mapped = _protect_sync(lambda: f(exit.error))
            if not _is_ok(mapped):
                return mapped
            return Err(mapped.value)

        return Effect(inner)

    def or_else[E2](self, f: Callable[[E], Effect[A, E2]]) -> Effect[A, E2]:
        async def inner() -> Exit[A, E2]:
            exit = await self
            if not _is_err(exit):
                return exit
            protected = await _protect_async(lambda: f(exit.error))
            if not _is_ok(protected):
                return protected
            return protected.value

        return Effect(inner)

    def tap_error[A2, E2](self, f: Callable[[E], Effect[A2, E2]]) -> Effect[A, E | E2]:
        async def inner() -> Exit[A, E | E2]:
            exit = await self
            if not _is_err(exit):
                return exit
            side = await _protect_async(lambda: f(exit.error))
            if not _is_ok(side):
                return side
            side_exit = side.value
            if _is_err(side_exit):
                return side_exit
            return exit

        return Effect(inner)

    def timeout(self, seconds: float, on_timeout: Thunk[E]) -> Effect[A, E]:
        async def inner() -> Exit[A, E]:
            try:
                return await asyncio.wait_for(fut=self, timeout=seconds)
            except asyncio.TimeoutError:
                try:
                    error = on_timeout()
                    return Err(error)
                except Exception as defect:
                    return Die(defect)

        return Effect(inner)

    def retry(
        self,
        attempts: int,
        should_retry: Optional[Callable[[E], bool]] = None,
        delay_seconds: float = 0.0,
    ):
        if attempts < 1:
            raise ValueError("attempts must be >= 1")

        async def inner():
            last: Optional[Err[E]] = None
            for i in range(attempts):
                exit = await self
                if not _is_err(exit):
                    return exit

                last = exit

                if should_retry is None:
                    should_continue = True
                else:
                    protected = _protect_sync(lambda: should_retry(exit.error))
                    if _is_die(protected):
                        return protected
                    should_continue = protected.value

                if not should_continue:
                    return exit

                if delay_seconds > 0 and i < attempts - 1:
                    await asyncio.sleep(delay_seconds)

            assert last is not None
            return last

        return Effect(inner)

    # endregion Effect — combinators


# region Internal helpers


def _is_ok[T](e: Exit[T, Any]) -> TypeIs[Ok[T]]:
    return isinstance(e, Ok)


def _is_err[T](e: Exit[Any, T]) -> TypeIs[Err[T]]:
    return isinstance(e, Err)


def _is_die(e: Exit[Any, Any]) -> TypeIs[Die]:
    return isinstance(e, Die)


def _protect_sync[A](f: Callable[[], A]) -> Ok[A] | Die:
    try:
        return Ok(value=f())
    except asyncio.CancelledError:
        raise
    except Exception as defect:
        return Die(defect)


async def _protect_async[A](f: Callable[[], Awaitable[A]]) -> Ok[A] | Die:
    try:
        return Ok(value=await f())
    except asyncio.CancelledError:
        raise
    except Exception as defect:
        return Die(defect)


# endregion Internal helpers
